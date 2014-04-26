from django.contrib.auth.models import AbstractUser
from django.db import models
from uuidfield import UUIDField
from django.utils.translation import ugettext_lazy as _
from clothstream.item.models import Item


class UserProfile(AbstractUser):
    uuid = UUIDField(auto=True)
    avatar = models.ImageField(_('Thumb photo'), help_text=_('Photo displayed when showing small picture'),
                               blank=True,
                               upload_to=lambda *args, **kwargs: '')
    picture = models.ImageField(_('Picture of user'), help_text=_('Picture of user'),
                                blank=True,
                               upload_to=lambda *args, **kwargs: '')
    about_me = models.TextField(_('About me'), help_text=_('User presentation'))
    favorite_items = models.ManyToManyField(Item, through='favorites.FavoritedItem', related_name='favorited_by')


# max_length should be overridden to 254 characters to be fully
# compliant with RFCs 3696 and 5321
email_field = UserProfile._meta.get_field("email")
email_field.max_length = 254
