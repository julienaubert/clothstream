from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField
from clothstream.item.serializers import ItemSerializer
from .models import Collection


class CollectionSerializer(serializers.HyperlinkedModelSerializer):
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'title', 'items', 'description')


class CollectionUpdateSerializer(serializers.HyperlinkedModelSerializer):
    items = PrimaryKeyRelatedField(many=True, write_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'title', 'items', 'description')
