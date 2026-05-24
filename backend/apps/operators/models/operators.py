from django.db import models
from django.utils import timezone
import uuid


class Operator(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self): 
        return self.name

class BusCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=50)  # Luxury, Standard, Sleeper
    has_ac = models.BooleanField()

    def __str__(self):
        return self.name

class Bus(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    operator = models.ForeignKey(Operator, on_delete=models.PROTECT, null=True, blank=True) # to be removed later
    plate_number = models.CharField(max_length=20, unique=True)
    capacity = models.PositiveIntegerField(help_text="Total number of seats")
    bus_type = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.plate_number} ({self.capacity} seats)"

class BusFeature(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='features')
    feature = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.bus} - {self.feature}"

class OperatorStaff(models.Model):

    ROLE_CHOICES = [
        ('OWNER', 'Owner'),
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE)
    user = models.OneToOneField("users.User", on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STAFF')


    def __str__(self):
        return self.user.email

class Driver(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField("users.User", on_delete=models.CASCADE, null=True, blank=True)
    operator = models.ForeignKey(Operator, on_delete=models.CASCADE, related_name='drivers', null=True, blank=True) # to be removed later
    name = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    state = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name