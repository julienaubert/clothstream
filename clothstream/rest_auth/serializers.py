from rest_framework import serializers
from clothstream.favorites.models import FavoritedItem
from clothstream.user_profile.models import UserProfile
from clothstream.user_profile.serializers import UserSerializer


class LoginSerializer(serializers.HyperlinkedModelSerializer):
    profile = serializers.SerializerMethodField('get_profile')
    favorited_items = serializers.SerializerMethodField('get_favorites')

    class Meta:
        model = UserProfile
        fields = ('profile', 'favorited_items')

    def get_profile(self, obj):
        return UserSerializer(instance=obj, context=self.context).data

    def get_favorites(self, obj):
        """ user has seen items as an anonymous-user up until logging-in, in order to update those
        on the front-end, the front-end receives all items favorited by user, and front-end updates its
        fetched-items
        """
        return FavoritedItem.objects.filter(user=obj).values_list('item__pk', flat=True)
