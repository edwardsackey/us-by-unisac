from rest_framework.permissions import BasePermission

class IsStationAgent(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_agent
        )


class IsOperatorStaff(BasePermission):
    """
    Allows access only to users who are linked to an Operator via OperatorStaff.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and has an operatorstaff profile
        return request.user.is_authenticated and hasattr(request.user, 'operatorstaff')

    def has_object_permission(self, request, view, obj):
        # Ensure the object belongs to the same operator as the user
        # This assumes the object (Bus, Driver) has an 'operator' field
        # or is the Operator instance itself.
        user_operator = request.user.operatorstaff.operator
        
        if isinstance(obj, type(user_operator)):
            return obj == user_operator
            
        return getattr(obj, 'operator', None) == user_operator