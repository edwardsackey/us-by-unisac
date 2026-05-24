from rest_framework import serializers
from bookings.models import Booking, Payment
from django.db import transaction
from stations.models import Trip, Route
from operators.models import BusFeature, Bus, Driver, BusCategory, OperatorStaff
from django.contrib.auth import get_user_model

User = get_user_model()

class BusFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusFeature
        fields = ['id', 'feature']

class BusCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BusCategory
        fields = ['id', 'name', 'has_ac']

class BusSerializer(serializers.ModelSerializer):
    # Nested serializer to handle features (e.g., "WiFi", "Toilet")
    features = BusFeatureSerializer(many=True, required=False)
    # Category is read-only for operators (managed by admin), but they select it via ID
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BusCategory.objects.all(), source='category', write_only=True, required=False
    )

    class Meta:
        model = Bus
        fields = ['id', 'plate_number', 'capacity', 'bus_type', 'features', 'category_id']
        # Note: We exclude 'operator' from fields because we set it automatically in the ViewSet

    def create(self, validated_data):
        features_data = validated_data.pop('features', [])
        bus = Bus.objects.create(**validated_data)
        for feature_data in features_data:
            BusFeature.objects.create(bus=bus, **feature_data)
        return bus

    def update(self, instance, validated_data):
        features_data = validated_data.pop('features', None)
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle features update (Delete old, create new is simplest strategy)
        if features_data is not None:
            instance.features.all().delete()
            for feature_data in features_data:
                BusFeature.objects.create(bus=instance, **feature_data)
        return instance

class DriverSerializer(serializers.ModelSerializer):
    # We display the user email for context
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Driver
        fields = ['id', 'name', 'phone', 'address', 'state', 'is_verified', 'email']
        read_only_fields = ['is_verified'] # Only Admin verifies drivers usually

class OperatorStaffSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = OperatorStaff
        fields = ['id', 'user', 'email', 'role']