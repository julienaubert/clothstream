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
        'NAME': 'clothstream_test.sqlite',
        'HOST': '',
        'PORT': ''
    },
    'postgres': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'clothstream_test',
        'HOST': '127.0.0.1',
        'PORT': '',
        'USER': 'postgres',
        'PASSWORD': '',
        'CONN_MAX_AGE': 0
    }
}

SOCIAL_AUTH_FACEBOOK_KEY = '230332697163931'
SOCIAL_AUTH_FACEBOOK_SECRET = 'd216e14487072824ef7e7e244db49571'
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']


db = os.environ.get('database', 'postgres')
if db not in SUPPORTED_DATABASES:
    raise Exception('Unknown database `%s`' % db)


# to easily catch cases where wrong pk is used (e.g. user.pk instead of user.profile.pk) we change sequences
def random_start_sequence(db):
    if db == 'postgres':
        # self.connection.execute "ALTER SEQUENCE #{self.table_name}_id_seq RESTART WITH #{options[:to]};"
        pass
    elif db == 'sqlite':
        # self.connection.execute "UPDATE sqlite_sequence SET seq=#{options[:to]} WHERE name='#{self.table_name}';"
        pass
    else:
        raise ValueError('Need add start-random-sequences for this db:', db)


random_start_sequence(db)


DATABASES = {'default': SUPPORTED_DATABASES[db]}

