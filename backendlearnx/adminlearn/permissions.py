from functools import wraps
from rest_framework.response import Response
from rest_framework import status


def get_role(user):
    """Return 'admin', 'subadmin', 'user', or None (not logged in)."""
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return "admin"
    return getattr(getattr(user, "profile", None), "role", "user")


def is_admin_user(user):
    """True for admin (superuser) or subadmin — i.e. someone allowed into the panel."""
    return get_role(user) in ("admin", "subadmin")


def has_module_permission(user, module):
    """
    Admin   -> True for every module.
    Subadmin -> True only if the matching flag is True on their profile.
    User    -> False.
    """
    role = get_role(user)
    if role == "admin":
        return True
    if role != "subadmin":
        return False
    from .models import MODULE_PERMISSIONS
    flag = MODULE_PERMISSIONS.get(module)
    return bool(flag and getattr(user.profile, flag, False))


def require_admin(view_func):
    """Only the main admin (superuser) may call this view."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if get_role(request.user) != "admin":
            return Response(
                {"detail": "Only the Admin can perform this action."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return view_func(request, *args, **kwargs)
    return wrapper


def require_module(module):
    """Admin bypasses; subadmin needs the flag; user is denied."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not has_module_permission(request.user, module):
                return Response(
                    {"detail": f"No permission for '{module}' module."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator