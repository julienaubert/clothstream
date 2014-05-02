""" Used to generate sampledata / test-data
"""
from clothstream.item.fixtures import item_factory
from clothstream.user_profile.fixtures import user_factory
from clothstream.user_profile.models import UserProfile
from clothstream.tests.fixture_lib import subargs, nextname

from .models import Item, Collection, CollectedItem
from django_dynamic_fixture import G


lorem = """Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat."""


def collection_factory(initial_items=3, **kwargs):
    if 'owner' not in kwargs:
        if UserProfile.objects.count() == 0:
            kwargs['owner'] = user_factory()
        else:
            kwargs['owner'] = UserProfile.objects.order_by('?')[0]
    if 'title' not in kwargs:
        kwargs['title'] = nextname('Collection')
    if 'description' not in kwargs:
        kwargs['description'] = lorem
    collection = G(Collection, **kwargs)
    if 'items' not in kwargs:
        if Item.objects.count() < initial_items:
            for _ in range(initial_items - Item.objects.count()):
                item_args = subargs(kwargs, 'item')
                item_factory(**item_args)
        if initial_items:
            for item in Item.objects.order_by('?')[:initial_items]:
                CollectedItem.objects.create(item=item, collection=collection)
    return collection
