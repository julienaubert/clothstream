from rest_framework import serializers
from clothstream.lib import rest
from .models import UserProfile


class UserSerializer(serializers.HyperlinkedModelSerializer):
    name = serializers.Field(source='get_full_name')
    avatar = rest.HyperlinkedFileField(source='avatar', required=False)
    picture = rest.HyperlinkedFileField(source='picture', required=False)

    class Meta:
        model = UserProfile
        fields = ('id', 'name', 'avatar', 'picture', 'about_me')
