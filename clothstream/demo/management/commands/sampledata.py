# -*- coding: utf-8 -*-
from django.core.management import BaseCommand
from clothstream.item.fixtures import item_factory
from optparse import make_option


def generate(item_count=100, **kwargs):
    for _ in range(item_count):
        item_factory()


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
        generate(**options)
