# Global settings
import os
from clothstream.lib.paths import DJANGO_ROOT, TMP_BUILDDIR

SITE_NAME = DJANGO_ROOT.name


DEBUG = False
TEMPLATE_DEBUG = True

ADMINS = (
# ('Your Name', 'your_email@example.com'),
)
MANAGERS = ADMINS

LOGIN_URL = "/login/"
LOGIN_REDIRECT_URL = "/"


TIME_ZONE = 'UTC'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
USE_L10N = True
USE_TZ = True

MEDIA_URL = '/media/'
STATIC_URL = '/static/'
STATICFILES_DIRS = (
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'djangosecure.middleware.SecurityMiddleware',
)


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake'
    },
    'resources': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

ROOT_URLCONF = 'clothstream.urls'

WSGI_APPLICATION = 'clothstream.wsgi.application'

TEMPLATE_DIRS = (
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

AUTH_USER_MODEL = 'user_profile.UserProfile'
SOCIAL_AUTH_USER_MODEL = 'user_profile.UserProfile'
SOCIAL_AUTH_FACEBOOK_KEY = 'your app id here'
SOCIAL_AUTH_FACEBOOK_SECRET = 'your app secret here'
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']

AUTHENTICATION_BACKENDS = (
    'social.backends.facebook.FacebookAppOAuth2',
    'social.backends.facebook.FacebookOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    # 'raven.contrib.django.raven_compat',
    # 'south',
    'djangosecure',
    'clothstream',
    'rest_framework',
    'clothstream.favorites',
    'clothstream.item',
    'clothstream.collection',
    'clothstream.rest_auth',
    'clothstream.user_profile',
    'clothstream.social_fb',
    'social.apps.django_app.default',
)


CLOTHSTREAM_LOG_DIR = str(TMP_BUILDDIR/'logs')

# django-secure
SECURE_SSL_REDIRECT = True
SECURE_SSL_HOST = None
SECURE_HSTS_SECONDS = 1
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_FRAME_DENY = True
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

EMAIL_SUBJECT_PREFIX = "[CLOTHSTREAM]"

RAVEN_CONFIG = {
    'dsn': '<BETA_RAVEN_DSN>',
}


# required to support custom-fields (DDF - for sampledata / tests)
DDF_DEFAULT_DATA_FIXTURE = 'clothstream.tests.ddf.DataFixture'


REST_FRAMEWORK = {
    'DEFAULT_MODEL_SERIALIZER_CLASS':
        'rest_framework.serializers.HyperlinkedModelSerializer',
    'DEFAULT_PERMISSION_CLASSES': [
        # 'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
    ],
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '5000/hour'
    },
    'PAGINATE_BY': 10,
}

from .logging_conf import *  # flake8: noqa

import json
import logging

filename = os.path.expanduser('~/.clothstream_credentials.json')
try:
    credentials = json.load(open(filename, 'r'))
except ValueError as e:
    logging.error("Invalid credential file `%s`: %s " % (filename, e))
    credentials = {"username": "", "password": ""}
except IOError:
    logging.warning("Unable to load %s" % filename)
    credentials = {"username": "", "password": ""}
