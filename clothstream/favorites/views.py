from rest_framework import viewsets, mixins, permissions
from clothstream.lib.permissions import FieldIsUserOrReadOnlyClassFactory
from .models import FavoritedItem
from .serializers import FavoritedItemSerializer


IsUserOrReadOnly = FieldIsUserOrReadOnlyClassFactory('user')


class FavoritedItemDestroy(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = FavoritedItem.objects.all()
    serializer_class = FavoritedItemSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsUserOrReadOnly)
    lookup_field = 'item__id'

    def get_queryset(self):
        return self.queryset.filter(user__pk=self.request.user.pk)


class FavoritedItemCreate(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = FavoritedItem.objects.all()
    serializer_class = FavoritedItemSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsUserOrReadOnly)

    def pre_save(self, obj):
        obj.user = self.request.user

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            serializer = FavoritedItemSerializer(instance=self.object, context=self.get_serializer_context())
            response.data = serializer.data
        return response
