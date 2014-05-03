from rest_framework import serializers
from rest_framework.relations import PrimaryKeyRelatedField, SlugRelatedField
from clothstream.styletags.models import ItemStyleTag, StyleTag


class StyleTagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = StyleTag
        fields = ('id', 'name',)


class ItemStyleTagSerializer(serializers.HyperlinkedModelSerializer):
    item = PrimaryKeyRelatedField(write_only=True)
    styletag = SlugRelatedField(write_only=True, slug_field='name')

    class Meta:
        model = ItemStyleTag
        fields = ('item', 'styletag')
