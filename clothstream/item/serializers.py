from rest_framework import serializers
from .models import Item
from ..lib import rest


class ItemSerializer(serializers.HyperlinkedModelSerializer):
    thumb_image_url = rest.HyperlinkedFileField(source='thumb_image')

    class Meta:
        model = Item
        fields = ('id', 'uuid', 'thumb_title', 'thumb_image_url', 'link')
