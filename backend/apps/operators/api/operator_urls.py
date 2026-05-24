# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.operator_views import (
    BusViewSet, DriverViewSet, OperatorStaffViewSet, OperatorStatsView
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'buses', BusViewSet, basename='operator-buses')
router.register(r'drivers', DriverViewSet, basename='operator-drivers')
router.register(r'staff', OperatorStaffViewSet, basename='operator-staff')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    path('stats/', OperatorStatsView.as_view(), name='operator-stats'),
]