from rest_framework import generics, permissions
from stations.models import Trip
from bookings.models import Booking
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status

from ..serializers.stations_serializers import (
    TripSerializer
)
class TripListView(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Basic filtering: Only show future trips
        
        
        queryset = Trip.objects.filter(departure_time__gt=timezone.now(), status='SCHEDULED')
        
        # URL parameters for filtering (e.g., ?source=Yola&destination=Jalingo)
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
    
class TripDetailsView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.AllowAny]

    lookup_field = 'pk'

    def get_queryset(self):
        # Basic filtering: Only show future trips
        queryset = Trip.objects.filter(departure_time__gt=timezone.now(), status='SCHEDULED')
        return queryset
