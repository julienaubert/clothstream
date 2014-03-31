import json
from django.conf import settings
from django.contrib.auth import user_logged_in
from django_webtest import WebTest
from django.core.urlresolvers import reverse
from clothstream.collection.fixtures import collection_factory
from clothstream.collection.models import Collection
from clothstream.item.fixtures import item_factory
from clothstream.tests.fixture_lib import user_factory
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
    csrf_checks = False

    def test_login_301_if_not_https(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url, json.dumps({'access_token': 55}), content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'http'})
        self.assertEqual(res.status_code, 301)

    def test_ok(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url,
                            json.dumps({'access_token': FB_TEST_USERS[0]}),
                            content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'https'})
        self.assertTrue(self.user_whom_logged_in.is_authenticated())
        self.assertEqual(res.json['id'], self.user_whom_logged_in.id)
        self.assertEqual(res.json['name'], self.user_whom_logged_in.get_full_name())
        self.assertEqual(res.json['default_collection']['id'], self.user_whom_logged_in.get_default_collection().pk)

    def test_ok_when_collection_has_items(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url,
                            json.dumps({'access_token': FB_TEST_USERS[0]}),
                            content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'https'})
        self.user_whom_logged_in.get_default_collection().items.add(item_factory())
        res = self.app.post(url,
                            json.dumps({'access_token': FB_TEST_USERS[0]}),
                            content_type='application/json',
                            extra_environ={'wsgi.url_scheme': 'https'})
        self.assertEqual(len(res.json['default_collection']['items']), 1)
        self.assertEqual(res.status_code, 200)

    def test_400_if_no_access_token(self):
        url = reverse('api.login', args=('facebook',))
        res = self.app.post(url, json.dumps({'access_token': ''}), content_type='application/json',
                            expect_errors=True, extra_environ={'wsgi.url_scheme': 'https'})
        self.assertEqual(res.status_code, 400)
