""" Used to generate sampledata / test-data
"""
from collections import namedtuple
import os
import random
import shutil
from pathlib import Path
import csv
from clothstream.styletags.models import ItemStyleTag

from .models import Item
from django_dynamic_fixture import G


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


def item_factory(with_statics=False, **kwargs):
    if 'price' not in kwargs:
        kwargs['price'] = random.randint(50, 10000)
    item = G(Item, **kwargs)
    sample = random_sample_item()
    if with_statics:
        copy_photo(item, kwargs.get('thumb_image', sample.filename))
    item.link = kwargs.get('link', sample.url)
    item.thumb_image = kwargs.get('thumb_image', sample.filename)
    item.thumb_title = kwargs.get('thumb_title', sample.name)
    item.material = kwargs.get('material', sample.material)
    item.color = kwargs.get('color', sample.color)
    item.save()
    return item
