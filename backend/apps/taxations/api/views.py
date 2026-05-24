from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from ..models import Vehicle, Payment
from .serializers import VehicleSerializer, PaymentSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('-registration_date')
    serializer_class = VehicleSerializer
    
    # Enable search functionality
    filter_backends = [filters.SearchFilter]
    search_fields = ['plate_number', 'phone_number']
    lookup_field = 'plate_number' # Allow accessing by /api/vehicles/YL-123/

    @action(detail=True, methods=['post'])
    def pay(self, request, plate_number=None):
        """
        Custom endpoint to add a payment directly to a vehicle.
        POST /api/vehicles/YL-123/pay/
        Body: { "amount": 150, "agent_id": "Agent-007" }
        """
        vehicle = self.get_object()
        
        amount = request.data.get('amount')
        agent_id = request.data.get('agent_id')
        
        if not amount or not agent_id:
            return Response(
                {"error": "Amount and Agent ID are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the payment
        payment = Payment.objects.create(
            vehicle=vehicle,
            amount=amount,
            collected_by=agent_id
        )

        # Return the updated vehicle state so the app updates instantly
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for the admin dashboard to see transaction history.
    """
    queryset = Payment.objects.all().order_by('-timestamp')
    serializer_class = PaymentSerializer