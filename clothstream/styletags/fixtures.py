""" Used to generate sampledata / test-data
"""
import random
from .models import StyleTag
from django_dynamic_fixture import G


sample_styletags = [
    'Rocker',
    'Folk',
    'Marine',
    'Boho',
    'Punk',
    'Tribal',
    'Preppy',
    'Hippie',
    'Retro',
    'Bohemian',
    'Minimalist',
]


def styletag_factory(**kwargs):
    if 'name' not in kwargs:
        kwargs['name'] = random.choice(sample_styletags)
    styletag = G(StyleTag, **kwargs)
    return styletag
