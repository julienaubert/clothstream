""" Used to generate sampledata / test-data
"""
import os
import random
import shutil
from pathlib import Path
import csv

from .models import Item
from django_dynamic_fixture import G

from django_dynamic_fixture.fixture_algorithms.sequential_fixture import SequentialDataFixture


class DataFixture(SequentialDataFixture):
    def uuidfield_config(self, field, key):
        if hasattr(field, '_create_uuid'):
            value = field._create_uuid()
        else:
            raise NotImplementedError()
        return str(value)


def rel(*parts):
    return str(Path(__file__).parent.joinpath(*parts))


def random_sample_item(SAMPLE_ITEMS=[]):
    if len(SAMPLE_ITEMS) == 0:
        with open(rel('sampledata', 'sample.csv'), newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                SAMPLE_ITEMS.append(tuple(row))
    name, filename, url = random.choice(SAMPLE_ITEMS)
    return name, filename, url


def item_factory(**kwargs):
    item = G(Item, thumb_title='dummy', thumb_image='dummy', link='dummy')
    name, filename, url = random_sample_item()
    dst = item.thumb_image.storage.path(filename)
    os.makedirs(str(Path(dst).parent), exist_ok=True)
    src = rel('sampledata', 'images', filename)
    shutil.copyfile(src, dst)
    item.link = url
    item.thumb_image = filename
    item.thumb_title = name
    item.save()
    return item
