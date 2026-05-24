from rest_framework import serializers
# from ..models import Vehicle, Payment
from apps.taxations.models.taxations import Payment, Vehicle

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'collected_by', 'timestamp', 'notes']

class VehicleSerializer(serializers.ModelSerializer):
    # We include these computed properties as read-only fields
    current_balance = serializers.FloatField(read_only=True)
    total_paid = serializers.FloatField(read_only=True)
    total_expected_revenue = serializers.FloatField(read_only=True)
    
    # Nest the last 5 payments so agents can see recent history
    recent_payments = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'plate_number', 'owner_name', 'phone_number', 
            'registration_date', 'is_active', 
            'current_balance', 'total_paid', 'total_expected_revenue',
            'recent_payments'
        ]

    def get_recent_payments(self, obj):
        # Get the last 3 payments for context
        payments = obj.payments.order_by('-timestamp')[:3]
        return PaymentSerializer(payments, many=True).data