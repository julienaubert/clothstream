from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField
from clothstream.favorites.models import FavoritedItem


class FavoritedItemSerializer(serializers.HyperlinkedModelSerializer):
    item = PrimaryKeyRelatedField(write_only=True)

    class Meta:
        model = FavoritedItem
        fields = ('item',)
