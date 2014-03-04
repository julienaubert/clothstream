""" use on local machine
"""
import os
import debug_toolbar
import django_extensions
import south
from clothstream.settings.test import *  # flake8: noqa


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

DEVDIR = os.path.dirname(__file__)

DEBUG = True
TEMPLATE_DEBUG = True

MEDIA_ROOT = os.path.join(DEVDIR, 'media')
STATIC_ROOT = os.path.join(DEVDIR, 'static')
