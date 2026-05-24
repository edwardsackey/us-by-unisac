from django.urls import path
from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView
from .views import UserViewSet

urlpatterns = [

    path('me/', UserViewSet.as_view(), name='profile'),

]