import json
from django.conf import settings
from django.contrib.auth import user_logged_in
from django.core.urlresolvers import reverse
from django_webtest import WebTest
from .facebook_api import FacebookGraphAPI, FacebookTestUsers


FB_TEST_USERS = []

FB = FacebookGraphAPI()

APP_ACCESS_TOKEN = FB.get_app_access_token(settings.SOCIAL_AUTH_FACEBOOK_KEY,
                                           settings.SOCIAL_AUTH_FACEBOOK_SECRET)


def ensure_has_test_users():
    global FB_TEST_USERS
    if len(FB_TEST_USERS):
        return
    fb = FacebookTestUsers(APP_ACCESS_TOKEN)
    users = fb.get_test_users(settings.SOCIAL_AUTH_FACEBOOK_KEY, APP_ACCESS_TOKEN)['data']
    FB_TEST_USERS = [user['access_token'] for user in users]
    if len(FB_TEST_USERS):
        return
    for num in range(3):
        new_user = {'password': '123', 'name': 'fb-user-' + num}
        fb.create_test_user(settings.SOCIAL_AUTH_FACEBOOK_KEY, APP_ACCESS_TOKEN, data=new_user)

ensure_has_test_users()


class WhoLoggedInMixin():
    user_whom_logged_in = None

    def on_login(sender, request, user, **kwargs):
        WhoLoggedInMixin.user_whom_logged_in = user
    user_logged_in.connect(on_login)


class TestFacebookLogin(WhoLoggedInMixin, WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def test_login_301_if_not_https(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url, json.dumps({'access_token': 55}), content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'http'})
        self.assertEqual(res.status_code, 301)

    def test_ok(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url, json.dumps({'access_token': FB_TEST_USERS[0]}), content_type='application/json')
        self.assertTrue(self.user_whom_logged_in.is_authenticated())

    def test_profile_returned_when_logged_in(self):
        # important as front-end assumes can use json response from login, instead of fetching from server
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url,
                            json.dumps({'access_token': FB_TEST_USERS[0]}),
                            content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'https'})
        self.assertEqual(self.user_whom_logged_in.id, res.json['id'])
        res_retrieve = self.app.get(reverse('userprofile-detail', args=(res.json['id'],)))
        self.assertEqual(res.json, res_retrieve.json)

    def test_400_if_no_access_token(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url, json.dumps({'access_token': ''}), content_type='application/json', expect_errors=True)
        self.assertEqual(res.status_code, 400)
