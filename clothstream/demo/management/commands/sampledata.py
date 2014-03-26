# -*- coding: utf-8 -*-
from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.core.management import BaseCommand
from clothstream.item.fixtures import item_factory
from optparse import make_option


def generate(item_count=100, **kwargs):
    for _ in range(item_count):
        item_factory(**kwargs)


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
        )
    help = 'Generate sample data'

    def handle(self, *args, **options):
        localhost_site()
        User.objects.create_superuser(username='a', password='a', email='admin@noreply.dummy')
        generate(**options)
