from django.contrib.auth.models import User
from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _
from clothstream.item.models import Item
from django.contrib import auth
from . import signals # flake8: noqa


class Collection(models.Model):
    uuid = UUIDField(auto=True)
    title = models.CharField(_('Title'), max_length=100, help_text=_('Name of the collection'))
    owner = models.ForeignKey(User, related_name='collections', help_text=_('User who created this collection'))
    items = models.ManyToManyField(Item, help_text=_("Items which are in the collection"))
    description = models.TextField(_('Description'), blank=True, help_text=_('Description of the collection'))
    public = models.BooleanField(_('Public'), help_text=_('Public collections can be seen by anyone'), default=True)

    class Meta:
        ordering = ['-pk']


def get_default_collection(self):
    try:
        return Collection.objects.filter(owner=self).all()[0]
    except IndexError:
        return None
auth.models.User.add_to_class('get_default_collection', get_default_collection)
