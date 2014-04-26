from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from clothstream.favorites.models import FavoritedItem
from .models import Item
from clothstream.lib import rest


class ItemSerializer(serializers.HyperlinkedModelSerializer):
    thumb_image_url = rest.HyperlinkedFileField(source='thumb_image')
    local_price = serializers.SerializerMethodField('get_local_price')
    local_currency = serializers.SerializerMethodField('get_local_currency')
    favorited_by_me = SerializerMethodField('get_favorited_by_me')

    class Meta:
        model = Item
        fields = ('id', 'uuid', 'thumb_title', 'thumb_image_url', 'link', 'local_price', 'local_currency', 'material',
                  'color', 'favorited_by_me')

    def get_favorited_by_me(self, obj):
        user_pk = self.context['request'].user.pk
        return FavoritedItem.objects.filter(user__pk=user_pk, item=obj).exists()

    def get_local_price(self, obj):
        return obj.price

    def get_local_currency(self, obj):
        return 'SEK'
