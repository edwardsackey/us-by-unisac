from rest_framework import serializers

from bookings.models import Booking
from django.db import transaction
from stations.api import (
    PassengerCreateSerializer, PassengerSerializer, TripSerializer
)
from stations.models import (
    Trip, Route, Passenger, StationAgent, Station
)
from operators.models import (
    Bus, BusFeature,
    BusCategory
)



class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True, read_only=True)
    trip = TripSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'trip',
            'status',
            'source',
            'created_at',
            'passengers',
        ]

class BookingSerializer(serializers.ModelSerializer):
    trip = TripSerializer(read_only=True)
    class Meta:
        model = Booking
        fields = ['id', 'trip', 'status']
        read_only_fields = ['id', 'status', 'seat_number']

class StationAgentBookingSerializer(serializers.Serializer):
    trip_id = serializers.UUIDField()
    passengers = PassengerCreateSerializer(many=True)
    payment_method = serializers.ChoiceField(
        choices=['CASH', 'TRANSFER', 'POS']
    )

    def create(self, validated_data):
        agent = self.context['agent']  # injected from view
        passengers_data = validated_data['passengers']

        with transaction.atomic():
            trip = Trip.objects.select_for_update().get(id=validated_data['trip_id'])

            if trip.seats_available < len(passengers_data):
                raise serializers.ValidationError("Not enough seats available.")

            booking = Booking.objects.create(
                trip=trip,
                source='STATION',
                station=agent.station,
                created_by_agent=agent,
                status='PAID',
            )

            taken_seats = set(
                Passenger.objects.filter(
                    booking__trip=trip
                ).values_list('seat_number', flat=True)
            )

            next_seat = 1
            for passenger in passengers_data:
                while next_seat in taken_seats:
                    next_seat += 1

                Passenger.objects.create(
                    booking=booking,
                    seat_number=next_seat,
                    **passenger
                )
                taken_seats.add(next_seat)

            return booking

class PassengerCreateBookingSerializer(serializers.Serializer):
    trip_id = serializers.UUIDField()
    passengers = PassengerCreateSerializer(many=True)

    def validate(self, data):
        if not data['passengers']:
            raise serializers.ValidationError("At least one passenger is required.")
        return data

    def create(self, validated_data):
        request = self.context['request']
        user = request.user if request.user.is_authenticated else None

        trip_id = validated_data['trip_id']
        passengers_data = validated_data['passengers']

        with transaction.atomic():
            trip = Trip.objects.select_for_update().get(id=trip_id)

            if trip.seats_available < len(passengers_data):
                raise serializers.ValidationError("Not enough available seats.")

            booking = Booking.objects.create(
                user=user,
                trip=trip,
                source='ONLINE',
                status='PENDING',
            )

            # Assign seats sequentially
            taken_seats = set(
                Passenger.objects.filter(
                    booking__trip=trip
                ).values_list('seat_number', flat=True)
            )

            next_seat = 1
            for passenger_data in passengers_data:
                while next_seat in taken_seats:
                    next_seat += 1

                Passenger.objects.create(
                    booking=booking,
                    seat_number=next_seat,
                    **passenger_data
                )
                taken_seats.add(next_seat)

            return booking
