""" Used to generate sampledata / test-data
"""
from collections import namedtuple
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


CsvSampleItem = namedtuple('CsvSampleItem', 'name, filename, url, material, color')


def random_sample_item(SAMPLE_ITEMS=[]):
    if len(SAMPLE_ITEMS) == 0:
        with open(rel('sampledata', 'sample.csv'), newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                SAMPLE_ITEMS.append(CsvSampleItem(*row))
    return random.choice(SAMPLE_ITEMS)


def copy_photo(item, filename):
    dst = item.thumb_image.storage.path(filename)
    os.makedirs(str(Path(dst).parent), exist_ok=True)
    src = rel('sampledata', 'images', filename)
    shutil.copyfile(src, dst)


def item_factory(**kwargs):
    item = G(Item, thumb_title='dummy', thumb_image='dummy', link='dummy', material='dummy')
    sample = random_sample_item()
    copy_photo(item, sample.filename)
    item.link = sample.url
    item.thumb_image = sample.filename
    item.thumb_title = sample.name
    item.material = sample.material
    item.color = sample.color
    item.save()
    return item
