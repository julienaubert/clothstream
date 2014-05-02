import json
from django_webtest import WebTest
from django.core.urlresolvers import reverse
from clothstream.collection.fixtures import collection_factory
from clothstream.collection.models import Collection, CollectedItem
from clothstream.item.fixtures import item_factory
from clothstream.user_profile.fixtures import user_factory
from clothstream.tests.lib import from_db


class TestListCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}

    def setUp(self):
        self.url = reverse('collection-list')

    def test_anonymous_can_list(self):
        collection_factory(initial_items=0)
        res = self.app.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)

    def test_can_filter_by_owner(self):
        collection1 = collection_factory(initial_items=0, owner=user_factory())
        collection_factory(initial_items=0, owner=user_factory())
        assert Collection.objects.count() > 1
        res = self.app.get(self.url, params={'owner': collection1.owner.pk})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)
        self.assertEqual(collection1.id, res.json['results'][0]['id'])

    def test_can_filter_by_public(self):
        owner = user_factory()
        collection1 = collection_factory(initial_items=0, owner=owner, public=False)
        collection2 = collection_factory(initial_items=0, owner=owner, public=True)
        res = self.app.get(self.url, user=owner, params={'owner': owner.pk, 'public': 'False'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)
        self.assertEqual(collection1.id, res.json['results'][0]['id'])
        res = self.app.get(self.url, params={'owner': owner.pk, 'public': 'True'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)
        self.assertEqual(collection2.id, res.json['results'][0]['id'])

    def test_private_collections_only_listed_for_owner(self):
        collection1 = collection_factory(initial_items=0, public=False)
        res = self.app.get(self.url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 0)
        res = self.app.get(self.url, user=collection1.owner)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 1)

    def test_private_collections_only_listed_for_owner__also_if_use_filter(self):
        collection1 = collection_factory(initial_items=0, owner=user_factory(), public=False)
        res = self.app.get(self.url, params={'owner': collection1.owner.pk, 'public': 'False'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json['count'], 0)


class TestDeleteCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.collection = collection_factory(initial_items=0)
        self.url = reverse('collection-delete-detail', args=(self.collection.pk,))

    def test_anonymous_cannot_delete(self):
        res = self.app.delete(self.url, expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_non_owner_cannot_delete(self):
        non_owner = user_factory()
        res = self.app.delete(self.url, user=non_owner, expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_owner_can_delete(self):
        res = self.app.delete(self.url, user=self.collection.owner)
        self.assertEqual(res.status_code, 204)
        self.assertFalse(Collection.objects.filter(pk=self.collection.id).exists())


class TestRetrieveCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}

    def test_anonymous_can_retrieve(self):
        collection = collection_factory(initial_items=0)
        url = reverse('collection-detail', args=(collection.pk,))
        res = self.app.get(url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(collection.title, res.json['title'])

    def test_private_collections_only_retrievable_by_owner(self):
        collection = collection_factory(initial_items=0, public=False)
        url = reverse('collection-detail', args=(collection.pk,))
        res = self.app.get(url, expect_errors=True)
        self.assertEqual(res.status_code, 404)
        res = self.app.get(url, user=collection.owner)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(collection.title, res.json['title'])


class TestCreateCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.url = reverse('collection-create-list')
        self.user = user_factory()
        self.title = u'a  ❤ ☀ ☆ ☂ ☻ ♞  title'

    def test_anonymous_cannot_create(self):
        res = self.app.post(self.url, json.dumps({'title': self.title}), content_type='application/json',
                            expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_create(self):
        res = self.app.post(self.url, json.dumps({'title': self.title}),
                            user=self.user, content_type='application/json')
        self.assertEqual(res.status_code, 201)
        collection = Collection.objects.all()[0]
        self.assertEqual(Collection.objects.count(), 1)
        self.assertEqual(collection.title, self.title)
        self.assertEqual(set(collection.items.all()), set())
        self.assertEqual(collection.owner, self.user)

    def test_create_returns_same_json_as_get(self):
        # important as front-end assumes can use json from create-response instead of fetching it from server
        res_create = self.app.post(self.url, json.dumps({'title': self.title}), content_type='application/json',
                                   user=self.user)
        res_retrieve = self.app.get(reverse('collection-detail', args=[res_create.json['id']]))
        self.assertEqual(res_create.json, res_retrieve.json)


class TestUpdate(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.user = user_factory()
        self.collection = collection_factory(initial_items=0, owner=self.user)
        self.item1 = item_factory()
        self.item2 = item_factory()
        self.url = reverse('collection-update-detail', args=[self.collection.pk])

    def test_patch_title(self):
        new_title = self.collection.title + 'new'
        res = self.app.patch(self.url, json.dumps({'title': new_title}), content_type='application/json',
                             user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.collection).title, new_title)

    def test_patch_description(self):
        new_description = self.collection.description + 'new'
        res = self.app.patch(self.url, json.dumps({'description': new_description}), content_type='application/json',
                             user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.collection).description, new_description)

    def test_patch_public(self):
        new_public_status = not self.collection.public
        res = self.app.patch(self.url, json.dumps({'public': 'True' if new_public_status else 'False'}),
                             content_type='application/json', user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.collection).public, new_public_status)

    def test_put_update(self):
        new_title = self.collection.title + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        new_description = self.collection.description + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        res = self.app.put(self.url, json.dumps({'title': new_title, 'description': new_description}),
                           content_type='application/json', user=self.user)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(from_db(self.collection).title, new_title)

    def test_403_if_not_owner(self):
        other_user = user_factory()
        new_title = self.collection.title + u' ❤ ☀ ☆ ☂ ☻ ♞ '
        res = self.app.patch(self.url, json.dumps({'title': new_title}), content_type='application/json',
                             user=other_user, expect_errors=True)
        self.assertEqual(res.status_code, 403)


class TestAddItemToCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.collection = collection_factory(initial_items=0)

    def test_anonymous_cannot_add_item(self):
        item = item_factory()
        url = reverse('collecteditem-create-list')
        res = self.app.post(url, json.dumps({'item': item.pk, 'collection': self.collection.pk}),
                            content_type='application/json', expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_user_can_add_item_to_their_collection(self):
        item = item_factory()
        url = reverse('collecteditem-create-list')
        res = self.app.post(url, json.dumps({'item': item.pk, 'collection': self.collection.pk}),
                            content_type='application/json', user=self.collection.owner)
        self.assertEqual({item}, set(self.collection.items.all()))

    def test_user_cannot_add_items_to_others_collections(self):
        item = item_factory()
        user = user_factory()
        url = reverse('collecteditem-create-list')
        print("hitting", url)
        res = self.app.post(url, json.dumps({'item': item.pk, 'collection': self.collection.pk}),
                            content_type='application/json', user=user, expect_errors=True)
        self.assertEqual(res.status_code, 403)


class TestRemoveItemFromCollection(WebTest):
    extra_environ = {'wsgi.url_scheme': 'https'}
    csrf_checks = False

    def setUp(self):
        self.collection = collection_factory(initial_items=0)

    def test_404_when_no_item_parameter(self):
        CollectedItem.objects.create(item=item_factory(), collection=self.collection)
        url = reverse('collecteditem-delete-detail', args=(self.collection.pk,))
        res = self.app.delete(url, user=self.collection.owner, expect_errors=True)
        self.assertEqual(res.status_code, 404)

    def test_user_can_remove_item_from_collection(self):
        item = item_factory()
        item_to_delete = item_factory()
        CollectedItem.objects.create(item=item, collection=self.collection)
        CollectedItem.objects.create(item=item_to_delete, collection=self.collection)
        assert {item, item_to_delete} == set(self.collection.items.all())
        url = reverse('collecteditem-delete-detail', args=(self.collection.pk,))
        self.app.delete(url, json.dumps({'item': item_to_delete.pk}), content_type='application/json',
                        user=self.collection.owner)
        self.assertEqual({item}, set(self.collection.items.all()))

    def test_user_cannot_remove_item_from_others_collection(self):
        item = item_factory()
        user = user_factory()
        CollectedItem.objects.create(item=item, collection=self.collection)
        assert {item} == set(self.collection.items.all())
        url = reverse('collecteditem-delete-detail', args=(self.collection.pk,))
        res = self.app.delete(url, json.dumps({'item': item.pk}), content_type='application/json',
                              user=user, expect_errors=True)
        self.assertEqual(res.status_code, 403)

    def test_404_when_remove_an_item_which_is_not_in_the_collection(self):
        item = item_factory()
        assert CollectedItem.objects.count() == 0
        url = reverse('collecteditem-delete-detail', args=(self.collection.pk,))
        res = self.app.delete(url, json.dumps({'item': item.pk}), content_type='application/json',
                              user=self.collection.owner, expect_errors=True)
        self.assertEqual(res.status_code, 404)

    def test_remove_item_when_exists_in_many_collections(self):
        item = item_factory()
        CollectedItem.objects.create(item=item, collection=self.collection)
        other_collection = collection_factory(initial_items=0)
        CollectedItem.objects.create(item=item, collection=other_collection)
        assert {item} == set(self.collection.items.all())
        url = reverse('collecteditem-delete-detail', args=(self.collection.pk,))
        res = self.app.delete(url, json.dumps({'item': item.pk}), content_type='application/json',
                              user=self.collection.owner, expect_errors=True)
        self.assertEqual(set(), set(self.collection.items.all()))
        self.assertEqual({item}, set(other_collection.items.all()))
