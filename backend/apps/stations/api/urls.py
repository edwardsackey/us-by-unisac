from django.urls import path
from .views.trips_views import (
    TripListView, TripDetailsView
)

urlpatterns = [
    # Public: Search for buses
    path('', TripListView.as_view(), name='trip-list'),
    
    # Public: Get details of a specific trip
    path('<str:pk>/', TripDetailsView.as_view(), name='trip-details'),
    
]