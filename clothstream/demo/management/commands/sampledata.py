# -*- coding: utf-8 -*-
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from clothstream.collection.fixtures import collection_factory
from clothstream.favorites.models import FavoritedItem
from clothstream.item.fixtures import item_factory
from optparse import make_option
from clothstream.item.models import Item
from clothstream.lib.modify_seq import setup_modified_seq
from clothstream.user_profile.fixtures import user_factory
from clothstream.user_profile.models import UserProfile


def generate(item__count=100, collection__count=100, user_profile__count=10, **kwargs):
    for _ in range(item__count):
        item_factory(with_statics=True)
    for _ in range(collection__count):
        collection_factory()
    for _ in range(user_profile__count):
        user = user_factory(skip_initial_collection=False)
        for item in Item.objects.order_by('?').all()[:min(10, item__count)]:
            FavoritedItem.objects.create(item=item, user=user)


def localhost_site():
    site = Site.objects.get(id=1)
    site.domain = 'localhost'
    site.save()


class Command(BaseCommand):
    option_list = BaseCommand.option_list + (
        make_option('--item-count',
            action='store',
            dest='item_count',
            default=100,
            help='Number of items to generate'),
        make_option('--collection-count',
            action='store',
            dest='collection_count',
            default=100,
            help='Number of collections to generate'),
        )
    help = 'Generate sample data'

    def handle(self, *args, **options):
        localhost_site()
        from django.db import connections
        for connection in connections.all():
            setup_modified_seq(connection)
        UserProfile.objects.create_superuser(username='a', password='a', email='admin@noreply.dummy')
        generate(**options)
