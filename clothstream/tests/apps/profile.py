import json
from django.core.urlresolvers import reverse
from django_webtest import WebTest
from clothstream.tests.fixture_lib import user_factory
from clothstream.tests.lib import from_db


class TestRetrieveCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}

    def test_anonymous_can_retrieve(self):
        user = user_factory()
        url = reverse('userprofile-detail', args=(user.pk,))
        res = self.app.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(user.get_full_name(), res.json['name'])


class TestUpdate(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()
        self.url = reverse('userprofile-update-detail', args=[self.user.pk])

    def test_patch_about_me(self):
        new_about_me = self.user.about_me + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        res = self.app.patch(self.url, json.dumps({'about_me': new_about_me}), content_type='application/json',
                             user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.user).about_me, new_about_me)

    def test_put_update(self):
        new_about_me = self.user.about_me + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        res = self.app.put(self.url, json.dumps({'about_me': new_about_me}),
                           content_type='application/json', user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.user).about_me, new_about_me)

    def test_403_if_not_owner(self):
        other_user = user_factory()
        new_about_me = self.user.about_me + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        res = self.app.patch(self.url, json.dumps({'about_me': new_about_me}), content_type='application/json',
                             user=other_user, expect_errors=True)
        self.assertEqual(res.status_code, 403)
