from social.apps.django_app.default.models import UserSocialAuth
from clothstream.tests.fixture_lib import user_factory, nextname


def social_auth_user_factory(**kwargs):
    # python social auth's model which complements User
    if 'user' not in kwargs:
        kwargs['user'] = user_factory()
    if 'provider' not in kwargs:
        kwargs['provider'] = 'facebook'
    if 'uid' not in kwargs:
        kwargs['uid'] = nextname('uid')
    if kwargs['provider'] == 'facebook':
        if 'extra_data' not in kwargs:
            kwargs['extra_data'] = {'access_token': nextname('invalid-access-token')}
    else:
        raise ValueError('only facebook supported now..')

    return UserSocialAuth.create(**kwargs)
