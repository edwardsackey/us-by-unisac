from django.urls import path
from .views.agent_trips_views import (
    AgentTripListView, AgentTripDetailsView
)

urlpatterns = [
    path('', AgentTripListView.as_view(), name='trip-list'),
    path('<str:pk>/', AgentTripDetailsView.as_view(), name='trip-details'),
    
]