import os
import sys
from pathlib import Path
# py.test messes up sys.path, must add manually
# (note: do not have __init__.py in project if project and app has same name, python takes "top package" and will
# import from project instead of from app)
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from django.conf import settings
from six import text_type



def pytest_configure(config):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clothstream.settings.test')

    # http://djangosnippets.org/snippets/646/
    class InvalidVarException(object):
        def __mod__(self, missing):
            try:
                missing_str = text_type(missing)
            except:
                missing_str = 'Failed to create string representation'
            raise Exception('Unknown template variable %r %s' % (missing, missing_str))

        def __contains__(self, search):
            if search == '%s':
                return True
            return False

    settings.TEMPLATE_DEBUG = True
    settings.TEMPLATE_STRING_IF_INVALID = InvalidVarException()

    # Disable static compiling in tests
    settings.STATIC_BUNDLES = {}

    # override a few things with our test specifics
    settings.INSTALLED_APPS = tuple(settings.INSTALLED_APPS) + (
        'clothstream.tests',
    )

    # This speeds up the tests considerably, pbkdf2 is by design, slow.
    settings.PASSWORD_HASHERS = [
        'django.contrib.auth.hashers.MD5PasswordHasher',
    ]
