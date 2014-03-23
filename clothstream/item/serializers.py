from rest_framework import serializers
from .models import Item
from ..lib import rest


class ItemSerializer(serializers.HyperlinkedModelSerializer):
    thumb_image_url = rest.HyperlinkedFileField(source='thumb_image')
    local_price = serializers.SerializerMethodField('get_local_price')
    local_currency = serializers.SerializerMethodField('get_local_currency')

    class Meta:
        model = Item
        fields = ('id', 'uuid', 'thumb_title', 'thumb_image_url', 'link', 'local_price', 'local_currency', 'material',
                  'color')

    def get_local_price(self, obj):
        return obj.price

    def get_local_currency(self, obj):
        return 'SEK'
