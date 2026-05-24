from django.db import models
from django.conf import settings
from stations.models import Trip
import uuid

class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    user = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    station = models.ForeignKey(
        "stations.Station",
        on_delete=models.SET_NULL,
        null=True,
        blank=True

    )

    created_by_agent = models.ForeignKey(
        "stations.StationAgent",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    source = models.CharField(
        max_length=20,
        choices=[('ONLINE', 'Online'), ('STATION', 'Station')],
        default='ONLINE'
    )

    status = models.CharField(
        max_length=20,
        choices=[('PENDING', 'Pending'), ('PAID', 'Paid'), ('CANCELLED', 'Cancelled')],
        default='PENDING',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.status}"


class Payment(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)

    method = models.CharField(
        max_length=20,
        choices=[
            ('CASH', 'Cash'),
            ('TRANSFER', 'Transfer'),
            ('POS', 'POS'),
            ('ONLINE', 'Online'),
        ]
    )

    reference = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[('SUCCESS', 'Success'), ('FAILED', 'Failed')]
    )

    paid_at = models.DateTimeField(auto_now_add=True)
