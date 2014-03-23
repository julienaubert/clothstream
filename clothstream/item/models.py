from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _


class Item(models.Model):
    uuid = UUIDField()
    thumb_title = models.CharField(_('Title'), max_length=100, help_text=_('Name displayed in thumb (short)'))
    thumb_image = models.ImageField(_('Title photo'), help_text=_('Photo displayed when showing thumb'),
                                    upload_to=lambda *args, **kwargs: '')
    link = models.URLField(_('URL'), help_text=_('Link to where the item can be purchased'))
    price = models.DecimalField(_('Price'), max_digits=6, decimal_places=2, help_text=_('Price in SEK of item'))
    material = models.TextField(_('Material'), help_text=_('Material description of item'))
    color = models.IntegerField('Color classification', help_text=_('Color classification of item'))
