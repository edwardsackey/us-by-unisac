from rest_framework import serializers


from bookings.models import Booking
from stations.models import Passenger
from django.db import transaction
from operators.api import (
    BusSerializer, 
    DriverSerializer
)
from stations.models import (
    Trip, Route, Station
    
)

from operators.models import (
    Bus, BusFeature,
    BusCategory
)

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'source', 'destination', 'estimated_duration']

class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ['id', 'name', 'location']


class TripSerializer(serializers.ModelSerializer):
    route = RouteSerializer(read_only=True)
    bus = BusSerializer(read_only=True)
    driver = DriverSerializer(read_only=True)
    seats_available = serializers.IntegerField(read_only=True)
    arrival_station = StationSerializer(read_only=True)
    departure_station = StationSerializer(read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id',
            'route',
            'departure_station',
            'arrival_station',
            'bus',
            'driver',
            'departure_time',
            'arrival_time',
            'base_price',
            'status',
            'seats_available',
        ]

class PassengerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['full_name', 'phone', 'email']

class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'full_name', 'phone', 'email', 'seat_number']



