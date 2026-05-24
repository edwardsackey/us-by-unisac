from django.urls import path
from .views.agent_booking_views import AgentCreateBookingView, AgentBookingsView, AgentCancelBookingView

urlpatterns = [
     
    path('history/', AgentBookingsView.as_view(), name='my-bookings'),
    path('book/', AgentCreateBookingView.as_view(), name='book-seat'),
    path('<int:pk>/cancel/', AgentCancelBookingView.as_view(), name='cancel-booking'),

]   