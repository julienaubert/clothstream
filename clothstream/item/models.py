from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _


class Item(models.Model):
    uuid = UUIDField()
    thumb_name = models.CharField(_('Title Name'), max_length=100, help_text=_('Name displayed in thumb (short)'))
    thumb_image = models.FileField(_('Title photo'), help_text=_('Photo displayed when showing thumb'),
                                   upload_to=lambda *args, **kwargs: '')
