from rest_framework import viewsets, exceptions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from operators.models import Operator, OperatorStaff, Driver, Bus
from ..serializers.operators_serializers import (
BusSerializer, DriverSerializer, OperatorStaffSerializer
)
from utils.permissions import IsOperatorStaff

class BaseOperatorViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet to reduce code duplication.
    Automatically filters by the logged-in user's Operator.
    """
    permission_classes = [IsAuthenticated, IsOperatorStaff]

    def get_operator(self):
        return self.request.user.operatorstaff.operator

class BusViewSet(BaseOperatorViewSet):
    serializer_class = BusSerializer

    def get_queryset(self):
        # Filter buses belonging to the user's operator
        return Bus.objects.filter(operator=self.get_operator())

    def perform_create(self, serializer):
        # Automatically assign the new bus to the user's operator
        serializer.save(operator=self.get_operator())

class DriverViewSet(BaseOperatorViewSet):
    serializer_class = DriverSerializer

    def get_queryset(self):
        # Assuming Driver model has an 'operator' FK or is linked via the User
        # NOTE: Your current Driver model does NOT have an operator FK.
        # It is linked 1-to-1 with User. You might need to adjust logic here.
        # Ideally, a Driver should belong to an Operator directly for management.
        
        # If Driver represents an employee of the Operator:
        # return Driver.objects.filter(operator=self.get_operator())
        
        # Based on your strict model provided:
        # You cannot filter Drivers by Operator unless you add an Operator FK to the Driver model.
        # For now, I will assume you add `operator = ForeignKey(Operator)` to Driver.
        return Driver.objects.filter(operator=self.get_operator())

    def perform_create(self, serializer):
        serializer.save(operator=self.get_operator())

class OperatorStaffViewSet(BaseOperatorViewSet):
    """
    Manage staff members. Only Owners/Admins should probably access this.
    """
    serializer_class = OperatorStaffSerializer

    def get_queryset(self):
        return OperatorStaff.objects.filter(operator=self.get_operator())



class OperatorStatsView(APIView):
    """
    Returns dashboard statistics for the logged-in Operator.
    """
    permission_classes = [IsAuthenticated, IsOperatorStaff]

    def get(self, request):
        # 1. Get the current operator
        operator = request.user.operatorstaff.operator

        # 2. Calculate Bus Stats
        # Note: Buses don't have an 'is_verified' field in your model, 
        # so we just show the total count.
        total_buses = Bus.objects.filter(operator=operator).count()

        # 3. Calculate Driver Stats
        # We assume you added the 'operator' FK to Driver as discussed.
        total_drivers = Driver.objects.filter(operator=operator).count()
        verified_drivers = Driver.objects.filter(operator=operator, is_verified=True).count()
        pending_drivers = total_drivers - verified_drivers

        # 4. Construct the response
        data = {
            "operator": {
                "name": operator.name,
                "is_verified": operator.is_verified,  # Use this to show a "Get Verified" badge if False
                "is_active": operator.is_active,
            },
            "assets": {
                "buses": {
                    "total": total_buses,
                },
                "drivers": {
                    "total": total_drivers,
                    "verified": verified_drivers,
                    "pending": pending_drivers,
                }
            }
        }
        
        return Response(data)