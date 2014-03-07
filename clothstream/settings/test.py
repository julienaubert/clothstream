""" use to run tests / CI
"""
from .base import *  # flake8: noqa

DEBUG = True
TEMPLATE_DEBUG = True
SECRET_KEY = 'fake_secret_key_for_clothstream'
SESSION_COOKIE_SECURE = False

PASSWORD_HASHERS = (
    'django.contrib.auth.hashers.MD5PasswordHasher',
)

SUPPORTED_DATABASES = {
    'sqlite': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'clothstream.sqlite',
        'HOST': '',
        'PORT': ''
    },
    'postgres': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'clothstream',
        'HOST': '127.0.0.1',
        'PORT': '',
        'USER': 'postgres',
        'PASSWORD': '',
        'CONN_MAX_AGE': None
    }
}

db = os.environ.get('database', 'postgres')
if db not in SUPPORTED_DATABASES:
    raise Exception('Unknown database `%s`' % db)

DATABASES = {'default': SUPPORTED_DATABASES[db]}
