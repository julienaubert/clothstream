from rest_framework import viewsets, mixins, permissions
from clothstream.styletags.models import ItemStyleTag, StyleTag
from clothstream.styletags.serializers import ItemStyleTagSerializer, StyleTagSerializer


class StyleTagList(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = StyleTag.objects.all()
    paginate_by = 5
    paginate_by_param = 'page_size'
    max_paginate_by = 100
    serializer_class = StyleTagSerializer


class ItemStyleTagCreate(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ItemStyleTag.objects.all()
    serializer_class = ItemStyleTagSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
