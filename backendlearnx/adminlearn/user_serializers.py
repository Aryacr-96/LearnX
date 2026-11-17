from django.contrib.auth.models import User
from rest_framework import serializers
from .models import MODULE_PERMISSIONS


class ManagedUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="profile.role", read_only=True)
    phone = serializers.CharField(source="profile.phone", required=False, allow_blank=True)
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "name", "role", "phone", "is_active"]
        read_only_fields = ["id", "role", "is_active", "username", "name"]

    def get_name(self, obj):
        full = f"{obj.first_name} {obj.last_name}".strip()
        return full or obj.email


class CreateSubAdminSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, min_length=6
    )
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=list(MODULE_PERMISSIONS.keys())),
        required=False,
        default=list,
    )

    def validate_email(self, v):
        v = v.strip().lower()
        if User.objects.filter(email__iexact=v).exists() or \
           User.objects.filter(username__iexact=v).exists():
            raise serializers.ValidationError("Email already registered.")
        return v


class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, required=False, allow_blank=True, min_length=6
    )
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, v):
        v = v.strip().lower()
        if User.objects.filter(email__iexact=v).exists() or \
           User.objects.filter(username__iexact=v).exists():
            raise serializers.ValidationError("Email already registered.")
        return v


class SubAdminPermissionsSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.ChoiceField(choices=list(MODULE_PERMISSIONS.keys())),
        allow_empty=True,
    )