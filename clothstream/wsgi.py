import os
import sys
sys.path.insert(0, os.path.expanduser('~/etc/clothstream'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "clothstream.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
