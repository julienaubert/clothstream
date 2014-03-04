""" Used to generate sampledata / test-data
"""

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


def item_factory(**kwargs):
    item = G(Item, **kwargs)
    return item
