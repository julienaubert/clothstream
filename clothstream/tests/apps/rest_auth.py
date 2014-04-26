import json
from django.contrib.auth import user_logged_out
from django.core.urlresolvers import reverse
from django_webtest import WebTest
from clothstream.favorites.models import FavoritedItem
from clothstream.item.fixtures import item_factory
from clothstream.tests.lib import mock_facebook_login, WhoLoggedInMixin
from clothstream.user_profile.fixtures import user_factory


class WhoLoggedOutMixin():
    user_who_logged_out = None

    def receiver(sender, request, user, **kwargs):
        WhoLoggedOutMixin.user_who_logged_out = user
    user_logged_out.connect(receiver)


class TestJsonReplyOnLogin(WhoLoggedInMixin, WhoLoggedOutMixin, WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()

    def test_mock_facebook_login(self):
        with mock_facebook_login(self.user) as (access_token, uid):
            url = reverse('api.login', args=('facebook',))
            res = self.app.post(url, json.dumps({'access_token': access_token}), content_type='application/json')
            self.assertEqual(self.user_who_logged_in, self.user)
            self.assertEqual(res.json['profile']['id'], self.user.pk)

    def test_logout(self):
        with mock_facebook_login(self.user) as (access_token, uid):
            url = reverse('api.login', args=('facebook',))
            res = self.app.post(url, json.dumps({'access_token': access_token}), content_type='application/json')
            self.assertEqual(self.user_who_logged_in, self.user)
        assert self.user_who_logged_in.is_authenticated()
        assert self.user_who_logged_out is None
        res = self.app.post(reverse('api.logout'), user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(self.user_who_logged_out, self.user)

    def test_profile_returned_when_logged_in(self):
        with mock_facebook_login(self.user) as (access_token, uid):
            # important as front-end assumes can use json response from login, instead of fetching from server
            url = reverse('api.login', args=('facebook',))
            res = self.app.post(url, json.dumps({'access_token': access_token}), content_type='application/json')
            res_retrieve = self.app.get(reverse('userprofile-detail', args=(res.json['profile']['id'],)))
            self.assertEqual(res.json['profile'], res_retrieve.json)

    def test_favorites_returned_when_logged_in(self):
        favorited_item = FavoritedItem.objects.create(item=item_factory(), user=self.user)
        with mock_facebook_login(self.user) as (access_token, uid):
            # important as front-end assumes can use json response from login, instead of fetching from server
            url = reverse('api.login', args=('facebook',))
            res = self.app.post(url, json.dumps({'access_token': access_token}), content_type='application/json')
            res_retrieve = self.app.get(reverse('userprofile-detail', args=(res.json['profile']['id'],)))
            self.assertEqual(res.json['favorited_items'], [favorited_item.item.pk])
