from contextlib import contextmanager
from django.contrib.auth import user_logged_in
from social.apps.django_app.default.models import UserSocialAuth
import mock


def from_db(instance):
    return instance.__class__.objects.get(pk=instance.pk)


class WhoLoggedInMixin():
    user_who_logged_in = None

    def on_login(sender, request, user, **kwargs):
        WhoLoggedInMixin.user_who_logged_in = user
    user_logged_in.connect(on_login)


@contextmanager
def mock_facebook_login(user):
    """ avoids requests to facebook on logging-in """
    facebook_uid = '111111111'
    try:
        social_user = UserSocialAuth.objects.filter(provider='facebook', uid=facebook_uid).get()
    except UserSocialAuth.DoesNotExist:
        UserSocialAuth.objects.get_or_create(provider='facebook', uid=facebook_uid, user=user)
    else:
        social_user.user = user
        social_user.save()

    facebook_access_token = (
                'CAADRfIKYOJsBAHOvnFxkI8mRmezaMmZC0TyLEO0SGAdTV1wflrnEfBFbpqcDdB5aakrbkZCkDe3iZAGtUfYh86ZAtN'
                'QWq5pUHFxqKaZBzuhZAEd6eaW68ysjhd5ArshINsEbuUqbwFAdYOV2e493oFKdlvotRrxk5G7YPcCyuVDQZB1Wtl6Bqk'
                'I1P1ZAuPPZA7uT85yH3C4FvCQZDZD')

    def dummy(*args, **kwargs):
        pass

    @contextmanager
    def mock_facebook():
        with mock.patch('facebook.get_app_access_token', dummy):
            yield

    @contextmanager
    def mock_python_social_auth(facebook_uid):
        def monkey_user_data(self, access_token, *args, **kwargs):
            return {
                'name': 'mocked',
                'timezone': 0,
                'verified': False,
                'updated_time': '2014-04-23T13:00:29+0000',
                'middle_name': 'mocked',
                'last_name': 'mocked',
                'locale': 'sv_SE',
                'gender': 'female',
                'link': 'https://www.facebook.com/profile.php?id={}'.format(facebook_uid),
                'first_name': 'mocked',
                'id': facebook_uid
            }
        with mock.patch('social.backends.facebook.FacebookOAuth2.user_data', monkey_user_data):
            yield

    @contextmanager
    def mock_enrich_via_facebook():
        with mock.patch('clothstream.social_fb.api.enrich_via_facebook', dummy):
            yield

    with mock_facebook():
        with mock_python_social_auth(facebook_uid):
            with mock_enrich_via_facebook():
                yield facebook_access_token, facebook_uid
