# -*- coding: utf-8 -*-
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from clothstream.collection.fixtures import collection_factory
from clothstream.item.fixtures import item_factory
from optparse import make_option
from clothstream.lib.modify_seq import setup_modified_seq
from clothstream.user_profile.models import UserProfile


def generate(item_count=100, collection_count=100, **kwargs):
    for _ in range(item_count):
        item_factory(with_statics=True)
    for _ in range(collection_count):
        collection_factory()


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
