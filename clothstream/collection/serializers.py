from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_framework.relations import PrimaryKeyRelatedField
from clothstream.item.serializers import ItemSerializer
from .models import Collection


class CollectionSerializer(serializers.HyperlinkedModelSerializer):
    items = ItemSerializer(many=True, read_only=True)
    owned_by_me = SerializerMethodField('get_owned_by_me')

    class Meta:
        model = Collection
        fields = ('id', 'title', 'items', 'description', 'owned_by_me', 'public')

    def get_owned_by_me(self, obj):
        user_pk = self.context['request'].user.pk
        return user_pk == obj.owner.pk


class CollectionUpdateSerializer(serializers.HyperlinkedModelSerializer):
    items = PrimaryKeyRelatedField(many=True, write_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'title', 'items', 'description', 'public')
