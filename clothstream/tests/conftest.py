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

    # we monkey-patch connection.creation, to be sure that we modify sequences after it has completely finished
    # (if we use post-syncdb signal, it won't work as some post-signals will actually call reset-sequences)
    from django.db import connections
    for connection in connections.all():
        from pytest_django.db_reuse import _monkeypatch
        from clothstream.lib.modify_seq import setup_modified_seq
        create_test_db = connection.creation.create_test_db

        def create_test_db_with_modified_sequences(self, *args, **kwargs):
            create_test_db(*args, **kwargs)
            setup_modified_seq(connection)
        _monkeypatch(connection.creation, 'create_test_db', create_test_db_with_modified_sequences)
