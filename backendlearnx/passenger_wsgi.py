import os
import sys

# Set up paths so Python can find backend modules
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendlearnx.settings')

# WSGI application entry point for Passenger / LiteSpeed / cPanel
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

