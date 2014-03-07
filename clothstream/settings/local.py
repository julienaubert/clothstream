""" use on local machine
"""
from ..settings.test import *  # flake8: noqa
from ..lib.paths import TMP_BUILDDIR

INSTALLED_APPS = INSTALLED_APPS + ('django_extensions', )

INSTALLED_APPS = INSTALLED_APPS + ('south',)
SKIP_SOUTH_TESTS = True
SOUTH_TESTS_MIGRATE = False

INSTALLED_APPS = INSTALLED_APPS + ('debug_toolbar', 'clothstream.demo')
MIDDLEWARE_CLASSES = MIDDLEWARE_CLASSES + ('debug_toolbar.middleware.DebugToolbarMiddleware',)


if 'djangosecure.middleware.SecurityMiddleware' in MIDDLEWARE_CLASSES:
    MIDDLEWARE_CLASSES = list(MIDDLEWARE_CLASSES)
    MIDDLEWARE_CLASSES.remove('djangosecure.middleware.SecurityMiddleware')
    MIDDLEWARE_CLASSES = tuple(MIDDLEWARE_CLASSES)

SECRET_KEY = 'develop'

DEBUG = True
TEMPLATE_DEBUG = True

MEDIA_ROOT = str(TMP_BUILDDIR/'media')
STATIC_ROOT = str(TMP_BUILDDIR/'static')
