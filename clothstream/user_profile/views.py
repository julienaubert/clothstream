from rest_framework import mixins, permissions, viewsets
from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import UserProfile
from .serializers import UserSerializer


class UserProfileListRetrieve(ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all()
    paginate_by = 5
    paginate_by_param = 'page_size'
    max_paginate_by = 100
    serializer_class = UserSerializer


class IsUserOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.pk == request.user.pk


class UserProfileUpdate(mixins.UpdateModelMixin, viewsets.GenericViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsUserOrReadOnly)
