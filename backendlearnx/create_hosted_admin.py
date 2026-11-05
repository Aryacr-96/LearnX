import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendlearnx.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

USERNAME = os.getenv("ADMIN_USER", "admin")
EMAIL = os.getenv("ADMIN_EMAIL", "admin@learnx.com")
PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpassword123")

user, created = User.objects.get_or_create(username=USERNAME)
user.email = EMAIL
user.is_superuser = True
user.is_staff = True
user.is_active = True
user.set_password(PASSWORD)
user.save()

token, _ = Token.objects.get_or_create(user=user)

print("=" * 50)
print(f"Superadmin '{USERNAME}' ready!")
print(f"Username: {USERNAME}")
print(f"Password: {PASSWORD}")
print(f"Token:    {token.key}")
print("=" * 50)

