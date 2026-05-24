from django.urls import path, include
from apps.bookings.api import bookings_urls
from apps.users.api.auth import urls as auth_urls
from apps.users.api.users import urls as users_urls
from apps.stations.api import urls as trips_urls

# agent imports
from apps.stations.api import agent_trips_urls
from apps.bookings.api import agent_bookings_urls


urlpatterns = [
    path('auth/', include(auth_urls)),
    path('profile/', include(users_urls)),
    path('trips/', include(trips_urls)),
    path('bookings/', include(bookings_urls)),


    # agent urls
    path('agent/trips/', include(agent_trips_urls)),
    path('agent/bookings/', include(agent_bookings_urls)),


    # operators 
    path('operators/', include('apps.operators.api.operator_urls')),
    path('taxations/', include('apps.taxations.api.urls')),


]
