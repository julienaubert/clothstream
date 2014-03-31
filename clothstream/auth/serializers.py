import json
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from clothstream.collection.serializers import CollectionSerializer


class UserLoginSerializer(serializers.HyperlinkedModelSerializer):
    default_collection = SerializerMethodField('get_default_collection')
    name = serializers.Field(source='get_full_name')

    class Meta:
        model = User
        fields = ('id', 'name', 'default_collection')

    def get_default_collection(self, user):
        collection = user.get_default_collection()
        if not collection:
            return ''
        else:
            return CollectionSerializer(instance=collection, context=self.context).data
