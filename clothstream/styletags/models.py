from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _
from clothstream.item.models import Item


class StyleTag(models.Model):
    uuid = UUIDField(auto=True)
    name = models.CharField(_('Name of style-tag'), max_length=100, help_text=_('Name displayed for this tag'),
                            unique=True)
    items = models.ManyToManyField(Item, through='styletags.ItemStyleTag', related_name='styletags')


class ItemStyleTag(models.Model):
    styletag = models.ForeignKey(StyleTag)
    item = models.ForeignKey(Item)

    class Meta:
        unique_together = ("styletag", "item")
