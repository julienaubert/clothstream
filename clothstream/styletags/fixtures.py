""" Used to generate sampledata / test-data
"""
import random
from .models import StyleTag
from django_dynamic_fixture import G


def styletag_factory(**kwargs):
    if 'name' not in kwargs:
        kwargs['name'] = random.choice(['Rocker',
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
                                        ])
    styletag = G(StyleTag, **kwargs)
    return styletag
