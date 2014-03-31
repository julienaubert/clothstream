from rest_framework import viewsets, mixins
from rest_framework.viewsets import ReadOnlyModelViewSet
from clothstream.lib.permissions import IsOwnerOrReadOnly
from .models import Collection
from .serializers import CollectionSerializer, CollectionUpdateSerializer
from rest_framework import permissions


class CollectionListRetrieve(ReadOnlyModelViewSet):
    queryset = Collection.objects.all()
    paginate_by = 5
    paginate_by_param = 'page_size'
    max_paginate_by = 100
    serializer_class = CollectionSerializer

    def filter_queryset(self, queryset):
        params = {k: self.request.QUERY_PARAMS.get(k) for k in self.request.QUERY_PARAMS}
        qs = queryset
        if 'owner' in params:
            qs = qs.filter(owner__id=params['owner'])
        return super().filter_queryset(qs)


class CollectionDestroy(mixins.DestroyModelMixin, viewsets.GenericViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly)


class CollectionUpdate(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionUpdateSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly)


class CollectionCreate(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionUpdateSerializer
    response_serializer_class = CollectionSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def pre_save(self, obj):
        obj.owner = self.request.user

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            serializer = CollectionSerializer(instance=self.object, context=self.get_serializer_context())
            response.data = serializer.data
        return response

