from django.urls import path
from .views.bookings_views import UserCreateBookingView, UserBookingsView, CancelBookingView

urlpatterns = [
     
    path('history/', UserBookingsView.as_view(), name='my-bookings'),
    path('book/user/', UserCreateBookingView.as_view(), name='book-seat'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),

]