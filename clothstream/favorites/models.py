from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _
from clothstream.item.models import Item
from clothstream.user_profile.models import UserProfile


class FavoritedItem(models.Model):
    uuid = UUIDField(auto=True)
    user = models.ForeignKey(UserProfile, help_text=_('Favorited by'))
    item = models.ForeignKey(Item, help_text=_('Item favorited'))
