from rest_framework import permissions
from clothstream.lib.get_field_value import get_field_value


class FieldIsUserOrReadOnly(permissions.BasePermission):
    """ use FieldIsUserOrReadOnlyClassFactory to create self.user_field """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return get_field_value(obj, self.user_field) == request.user


def FieldIsUserOrReadOnlyClassFactory(user_field='user'):
    """ returns a class which will compare request.user against the field `user_field` in the object
    (use class-factory as Django Rest Framework takes classes and not instances)
    """
    class_type = type(FieldIsUserOrReadOnly.__name__, (FieldIsUserOrReadOnly,), {'user_field': user_field})
    return class_type
