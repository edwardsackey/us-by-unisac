from .serializers import UserProfileSerializer
from users.models import User
from rest_framework import viewsets, generics
from rest_framework import permissions

class UserViewSet(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    # def get_queryset(self):
    #     return User.objects.filter(id=self.request.user.id)