from rest_framework import generics, permissions
from stations.models import Trip
from bookings.models import Booking
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from utils.permissions import IsStationAgent
from stations.models import Trip, StationAgent
from ..serializers.stations_serializers import (
    TripSerializer
)


class AgentTripListView(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsStationAgent]

    def get_queryset(self):
        agent = StationAgent.objects.select_related('station').get(
            user=self.request.user
        )

        queryset = Trip.objects.filter(
            departure_station=agent.station,
            departure_time__gt=timezone.now(),
            status='SCHEDULED'
        )
        
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date') # YYYY-MM-DD

        

        if source:
            queryset = queryset.filter(route__source__icontains=source)
        if destination:
            queryset = queryset.filter(route__destination__icontains=destination)
        if date:
            queryset = queryset.filter(departure_time__date=date)
            
        return queryset
    
class AgentTripDetailsView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsStationAgent]

    lookup_field = 'pk'

    def get_queryset(self):
        agent = StationAgent.objects.select_related('station').get(
            user=self.request.user
        )

        queryset = Trip.objects.filter(
            departure_station=agent.station,
            departure_time__gt=timezone.now(),
            status='SCHEDULED'
        )
        # Basic filtering: Only show future trips
        queryset = Trip.objects.filter(departure_time__gt=timezone.now(), status='SCHEDULED')
        return queryset
