from rest_framework import generics, permissions
from stations.models import Trip
from bookings.models import Booking

from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from utils.permissions import IsStationAgent
from stations.models import StationAgent, Station
from ..serializers.serializers import (
    TripSerializer, BookingSerializer, StationAgentBookingSerializer
)

class AgentCreateBookingView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = StationAgentBookingSerializer
    permission_classes = [IsStationAgent]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)   


class AgentBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsStationAgent]

    def get_queryset(self):

        agent = StationAgent.objects.select_related('station').get(
            user=self.request.user
        )
        if not agent in StationAgent.objects.filter(station=agent.station):
            return Booking.objects.none()
        return Booking.objects.filter(created_by_agent=agent)



class AgentCancelBookingView(APIView):
    permission_classes = [IsStationAgent]

    def post(self, request, pk):
        booking = Booking.objects.get(id=pk)
        if not booking:
            return Response({'message': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
        if booking.user != request.user:
            return Response({'message': 'You are not authorized to cancel this booking.'}, status=status.HTTP_403_FORBIDDEN)
        if booking.status != 'PENDING':
            return Response({'message': 'You can only cancel pending bookings.'}, status=status.HTTP_400_BAD_REQUEST)
        if booking.trip.departure_time < timezone.now():
            return Response({'message': 'You can only cancel bookings before the departure time.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if booking.trip.seats_available >= booking.trip.bus.capacity:
            return Response({'message': 'This bus is fully booked. You cannot cancel this booking.'}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'CANCELLED'
        booking.save()
        return Response({'message': 'Booking cancelled successfully.'}, status=status.HTTP_200_OK)