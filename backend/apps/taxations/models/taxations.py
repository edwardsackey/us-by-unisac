from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum

class Vehicle(models.Model):
    # Standardizing plate number to uppercase to avoid "yl-123" vs "YL-123" issues
    plate_number = models.CharField(max_length=20, unique=True, db_index=True)
    owner_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    
    # Daily tax rate (flexible, in case government increases it from 150)
    daily_rate = models.DecimalField(max_digits=6, decimal_places=2, default=150.00)
    
    registration_date = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.plate_number = self.plate_number.upper().strip()
        super().save(*args, **kwargs)

    @property
    def total_expected_revenue(self):
        """Calculates how much they SHOULD have paid since registration."""
        if not self.is_active:
            return 0
            
        today = timezone.now().date()
        # Ensure we count at least 1 day if they registered today
        days_active = (today - self.registration_date).days
        days_active = max(days_active + 1, 1) # +1 to include today
        
        return days_active * float(self.daily_rate)

    @property
    def total_paid(self):
        """Sum of all verified payments."""
        result = self.payments.aggregate(total=Sum('amount'))
        return result['total'] or 0.0

    @property
    def current_balance(self):
        """
        Positive number = They have credit (Good).
        Negative number = They owe money (Bad).
        """
        return self.total_paid - self.total_expected_revenue

    def __str__(self):
        return f"{self.plate_number} ({self.owner_name})"

class Payment(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # We track which agent collected it to prevent fraud
    collected_by = models.CharField(max_length=100, help_text="Agent ID or Name") 
    
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"₦{self.amount} - {self.vehicle.plate_number}"