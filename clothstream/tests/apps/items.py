import json
from django_webtest import WebTest
from django.core.urlresolvers import reverse
from clothstream.item.fixtures import item_factory


class TestListItems(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}

    def assertIsSubsetOf(self, subset, of):
        self.assertTrue(subset <= of)

    def setUp(self):
        self.url = reverse('item-list')

    def test_list_items(self):
        item1 = item_factory()
        item2 = item_factory()
        res = self.app.get(self.url)
        self.assertIsSubsetOf({item1.id, item2.id},
                              {obj['id'] for obj in res.json['results']})

    def test_filter_color(self):
        item1 = item_factory(color=1)
        item2 = item_factory(color=2)
        res = self.app.get(self.url, params={'colors': [1]})
        self.assertEqual({item1.id}, {obj['id'] for obj in res.json['results']})

    def test_filter_min_price(self):
        item1 = item_factory(price=1)
        item2 = item_factory(price=2)
        res = self.app.get(self.url, params={'min_price': 2})
        self.assertEqual({item2.id}, {obj['id'] for obj in res.json['results']})

    def test_filter_max_price(self):
        item1 = item_factory(price=1)
        item2 = item_factory(price=2)
        res = self.app.get(self.url, params={'max_price': 1})
        self.assertEqual({item1.id}, {obj['id'] for obj in res.json['results']})
