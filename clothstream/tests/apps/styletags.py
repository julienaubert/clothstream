import json
from django_webtest import WebTest
from django.core.urlresolvers import reverse
from clothstream.item.fixtures import item_factory
from clothstream.styletags.fixtures import styletag_factory
from clothstream.user_profile.fixtures import user_factory


class TestListStyleTags(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}

    def setUp(self):
        self.url = reverse('styletag-list')

    def test_anonymous_can_list(self):
        styletag = styletag_factory()
        res = self.app.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)
        self.assertEqual(styletag.name, res.json['results'][0]['name'])


class TestAddStyleTagToItem(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()

    def test_anonymous_cannot_add_styletag_to_item(self):
        url = reverse('itemstyletag-create-list')
        res = self.app.post(url, expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_user_can_add_styletag_to_item(self):
        item = item_factory()
        styletag = styletag_factory()
        url = reverse('itemstyletag-create-list')
        res = self.app.post(url, json.dumps({'item': item.pk, 'styletag': styletag.name}),
                            content_type='application/json', user=self.user)
        self.assertEqual({styletag}, set(item.styletags.all()))

    def test_user_cannot_add_non_existing_styletag_to_item(self):
        item = item_factory()
        url = reverse('itemstyletag-create-list')
        res = self.app.post(url, json.dumps({'item': item.pk, 'styletag': 'doesnotexist'}),
                            content_type='application/json', user=self.user, expect_errors=True)
        self.assertEqual(res.status_code, 400)

