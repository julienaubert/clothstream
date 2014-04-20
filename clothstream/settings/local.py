""" use on local machine
"""
from ..settings.test import *  # flake8: noqa
from ..lib.paths import TMP_BUILDDIR, PROJECT_DIR

INSTALLED_APPS = INSTALLED_APPS + ('django_extensions', )

INSTALLED_APPS = INSTALLED_APPS + ('south',)
SKIP_SOUTH_TESTS = True
SOUTH_TESTS_MIGRATE = False

INSTALLED_APPS = INSTALLED_APPS + ('debug_toolbar', 'clothstream.demo')
MIDDLEWARE_CLASSES = MIDDLEWARE_CLASSES + (
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)

if 'djangosecure.middleware.SecurityMiddleware' in MIDDLEWARE_CLASSES:
    MIDDLEWARE_CLASSES = list(MIDDLEWARE_CLASSES)
    MIDDLEWARE_CLASSES.remove('djangosecure.middleware.SecurityMiddleware')
    MIDDLEWARE_CLASSES = tuple(MIDDLEWARE_CLASSES)


MIDDLEWARE_CLASSES = (
    'clothstream.lib.rest.ConsoleDebug',
) + MIDDLEWARE_CLASSES


if 'CONN_MAX_AGE' in DATABASES['default']:
    # The development server creates a new thread for each request it handles,
    # negating the effect of persistent connections. Don't enable them during development.
    DATABASES['default']['CONN_MAX_AGE'] = 0

SECRET_KEY = 'develop'

SOCIAL_AUTH_FACEBOOK_KEY = '230332697163931'
SOCIAL_AUTH_FACEBOOK_SECRET = 'd216e14487072824ef7e7e244db49571'
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']

DEBUG = True
TEMPLATE_DEBUG = True

MEDIA_ROOT = str(TMP_BUILDDIR/'media')
STATIC_ROOT = str(TMP_BUILDDIR/'static')

DATABASES['default']['NAME'] = DATABASES['default']['NAME'].replace('test', 'local')
