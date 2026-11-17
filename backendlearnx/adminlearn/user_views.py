import secrets
import string

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .models import MODULE_PERMISSIONS
from .permissions import require_admin, get_role
from .user_serializers import (
    ManagedUserSerializer,
    CreateSubAdminSerializer,
    CreateUserSerializer,
    SubAdminPermissionsSerializer,
)
from .utils import send_credentials_email


def _gen_password(n=10):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(n))


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------
@api_view(["POST"])
@authentication_classes([]) 
@permission_classes([AllowAny])
def admin_login(request):
    identifier = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    if not identifier or not password:
        return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    user_obj = User.objects.filter(email__iexact=identifier).first() or \
               User.objects.filter(username__iexact=identifier).first()

    if not user_obj:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user_obj.username, password=password)

    if not user:
        return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({"detail": "This account is disabled."}, status=status.HTTP_403_FORBIDDEN)

    role = "admin" if user.is_superuser else getattr(getattr(user, "profile", None), "role", "user")
    
    if role not in ("admin", "subadmin"):
        return Response({"detail": "You do not have permission to access the admin panel."}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)

    perms = {}
    if role == "admin":
        perms = {k: True for k in MODULE_PERMISSIONS}
    elif role == "subadmin":
        perms = {k: getattr(user.profile, flag, False) for k, flag in MODULE_PERMISSIONS.items()}

    must_change = getattr(getattr(user, "profile", None), "must_change_password", False)

    return Response({
        "token": token.key,
        "username": user.username,
        "email": user.email,
        "name": user.first_name or user.username,
        "role": role,
        "permissions": perms,
        "must_change_password": must_change,
    }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Create Sub Admin
# ---------------------------------------------------------------------------
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def create_sub_admin(request):
    s = CreateSubAdminSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    data = s.validated_data
    email = data["email"]
    
    # Use the password provided by the admin, or generate one if empty
    password = (data.get("password") or "").strip() or _gen_password()

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
    )
    user.profile.role = "subadmin"
    user.profile.phone = data.get("phone", "")
    user.profile.created_by = request.user
    
    # 👇 THIS IS THE CRITICAL LINE TO FORCE PASSWORD CHANGE
    user.profile.must_change_password = True 
    
    for module_key in data.get("permissions", []):
        flag = MODULE_PERMISSIONS.get(module_key)
        if flag:
            setattr(user.profile, flag, True)
    user.profile.save()

    mail_error = None
    try:
        send_credentials_email(user.email, user.username, password, "Sub Admin")
    except Exception as e:
        mail_error = str(e)

    payload = {
        "message": (
            f"Sub Admin created. Credentials emailed to {user.email}."
            if not mail_error
            else "Sub Admin created, but email could not be sent."
        ),
        "user": ManagedUserSerializer(user).data,
    }
    if mail_error:
        payload["mail_error"] = mail_error
    return Response(payload, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Create Regular User
# ---------------------------------------------------------------------------
@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def create_user(request):
    s = CreateUserSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    data = s.validated_data
    email = data["email"]
    password = (data.get("password") or "").strip() or _gen_password()

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
    )
    user.profile.role = "user"
    user.profile.phone = data.get("phone", "")
    user.profile.created_by = request.user
    user.profile.must_change_password = True # 👈 Force change for regular users too
    user.profile.save()

    mail_error = None
    try:
        send_credentials_email(user.email, user.username, password, "User")
    except Exception as e:
        mail_error = str(e)

    payload = {
        "message": (
            f"User created. Credentials emailed to {user.email}."
            if not mail_error
            else "User created, but email could not be sent."
        ),
        "user": ManagedUserSerializer(user).data,
    }
    if mail_error:
        payload["mail_error"] = mail_error
    return Response(payload, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# Update Permissions
# ---------------------------------------------------------------------------
@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def update_subadmin_permissions(request, pk):
    try:
        user = User.objects.select_related("profile").get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.profile.role != "subadmin":
        return Response({"detail": "This user is not a Sub Admin."}, status=status.HTTP_400_BAD_REQUEST)

    s = SubAdminPermissionsSerializer(data=request.data)
    if not s.is_valid():
        return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

    selected = set(s.validated_data["permissions"])
    for module_key, flag in MODULE_PERMISSIONS.items():
        setattr(user.profile, flag, module_key in selected)
    user.profile.save()

    return Response({
        "message": "Permissions updated.",
        "user": ManagedUserSerializer(user).data,
        "permissions": sorted(selected),
    })


# ---------------------------------------------------------------------------
# List Users
# ---------------------------------------------------------------------------
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def list_managed_users(request):
    users = (
        User.objects
        .select_related("profile")
        .filter(profile__role__in=["subadmin", "user"])
        .order_by("-date_joined")
    )
    return Response(ManagedUserSerializer(users, many=True).data)


# ---------------------------------------------------------------------------
# Toggle Active Status
# ---------------------------------------------------------------------------
@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def toggle_user_active(request, pk):
    try:
        user = User.objects.select_related("profile").get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.is_superuser:
        return Response({"detail": "Cannot modify the Admin account."}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save(update_fields=["is_active"])

    if not user.is_active:
        Token.objects.filter(user=user).delete()

    return Response({"message": "Updated.", "is_active": user.is_active})


# ---------------------------------------------------------------------------
# Who Am I
# ---------------------------------------------------------------------------
@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def whoami(request):
    if not (request.user and request.user.is_authenticated):
        return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

    role = get_role(request.user)
    if role == "admin":
        perms = {k: True for k in MODULE_PERMISSIONS}
    elif role == "subadmin":
        perms = {k: getattr(request.user.profile, flag, False) for k, flag in MODULE_PERMISSIONS.items()}
    else:
        perms = {}

    name = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "name": name,
        "role": role,
        "permissions": perms,
        "must_change_password": getattr(request.user.profile, "must_change_password", False),
    })


# ---------------------------------------------------------------------------
# Delete User
# ---------------------------------------------------------------------------
@api_view(["DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
@require_admin
def delete_managed_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.is_superuser:
        return Response({"detail": "Cannot delete the main Admin account."}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)