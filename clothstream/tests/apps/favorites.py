import json
from django_webtest import WebTest
from django.core.urlresolvers import reverse
from clothstream.favorites.models import FavoritedItem
from clothstream.item.fixtures import item_factory
from clothstream.user_profile.fixtures import user_factory


class TestCreateFavoriteItem(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()

    def test_anonymous_cannot_favorite_item(self):
        url = reverse('favoriteditem-create-list')
        res = self.app.post(url, expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_user_can_favorite_an_item(self):
        item = item_factory()
        url = reverse('favoriteditem-create-list')
        res = self.app.post(url, json.dumps({'item': item.pk}), content_type='application/json', user=self.user)
        self.assertEqual({item}, set(self.user.favorite_items.all()))


class TestDeleteFavoriteItem(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()

    def test_user_can_undo_favorite_an_item(self):
        item = item_factory()
        FavoritedItem.objects.create(item=item, user=self.user)
        assert {item} == set(self.user.favorite_items.all())
        url = reverse('favoriteditem-delete-detail', args=(item.pk,))
        res = self.app.delete(url, user=self.user)
        self.assertEqual(set(), set(self.user.favorite_items.all()))

    def test_404_when_delete_non_favorited_item(self):
        item = item_factory()
        assert FavoritedItem.objects.count() == 0
        url = reverse('favoriteditem-delete-detail', args=(item.pk,))
        res = self.app.delete(url, user=self.user, expect_errors=True)
        self.assertEqual(res.status_code, 404)

    def test_undo_favorite_when_item_favorited_by_many(self):
        item = item_factory()
        other_user = user_factory()
        FavoritedItem.objects.create(item=item, user=self.user)
        FavoritedItem.objects.create(item=item, user=other_user)
        assert {item} == set(self.user.favorite_items.all())
        url = reverse('favoriteditem-delete-detail', args=(item.pk,))
        res = self.app.delete(url, user=self.user)
        self.assertEqual(set(), set(self.user.favorite_items.all()))
        self.assertEqual({item}, set(other_user.favorite_items.all()))
