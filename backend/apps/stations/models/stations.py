from django.db import models
from django.utils import timezone
import uuid


class Station(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    location = models.TextField()

    def __str__(self):
        return self.name    

class StationAgent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField("users.User", on_delete=models.CASCADE)
    station = models.ForeignKey("stations.Station", on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.email} - {self.user.first_name} {self.user.last_name}"


class Route(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    estimated_duration = models.DurationField(help_text="e.g. 04:00:00 for 4 hours")

    def __str__(self):
        return f"{self.source} to {self.destination}"


class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    route = models.ForeignKey(Route, on_delete=models.CASCADE)

    departure_station = models.ForeignKey(
        Station,
        on_delete=models.PROTECT,
        related_name="departing_trips",
        null=True
    )
    arrival_station = models.ForeignKey(
        Station,
        on_delete=models.PROTECT,
        related_name="arriving_trips",
        null=True
    )

    bus = models.ForeignKey("operators.Bus", on_delete=models.PROTECT)
    driver = models.ForeignKey("operators.Driver", on_delete=models.SET_NULL, null=True)

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    base_price = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=[
            ('SCHEDULED', 'Scheduled'),
            ('ON_GOING', 'On Going'),
            ('COMPLETED', 'Completed'),
            ('CANCELLED', 'Cancelled'),
        ],
        default='SCHEDULED'
    )


    @property
    def seats_available(self):
        return self.bus.capacity - self.bookings.filter(status='PAID').count()


class Passenger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name='passengers'
    )

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    seat_number = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['seat_number', 'booking'],
                name='unique_seat_per_booking'
            )
        ]

    def __str__(self):
        return f"{self.full_name} (Seat {self.seat_number})"
