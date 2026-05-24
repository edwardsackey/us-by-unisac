from .models import (
    Trip, Route, StationAgent, Station, Passenger,
)

from django.contrib import admin

admin.site.register(Trip)
admin.site.register(Route)

admin.site.register(StationAgent)
admin.site.register(Station)
admin.site.register(Passenger)
