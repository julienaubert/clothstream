"""
This is taken from https://github.com/saxix/django-adminactions/blob/develop/adminactions/utils.py
With minor modifications to make it python3 compatible.
"""
import six


def get_attr(obj, attr, default=None):
    """Recursive get object's attribute. May use dot notation.

    >>> class C(object): pass
    >>> a = C()
    >>> a.b = C()
    >>> a.b.c = 4
    >>> get_attr(a, 'b.c')
    4

    >>> get_attr(a, 'b.c.y', None)

    >>> get_attr(a, 'b.c.y', 1)
    1
    """
    if '.' not in attr:
        ret = getattr(obj, attr, default)
    else:
        L = attr.split('.')
        ret = get_attr(getattr(obj, L[0], default), '.'.join(L[1:]), default)

    if isinstance(ret, BaseException):
        raise ret
    return ret


def getattr_or_item(obj, name):
    try:
        ret = get_attr(obj, name, AttributeError())
    except AttributeError:
        try:
            ret = obj[name]
        except KeyError:
            raise AttributeError("%s object has no attribute/item '%s'" % (obj.__class__.__name__, name))
    return ret


def get_field_value(obj, field, usedisplay=True, raw_callable=False):
    """
    returns the field value or field representation if get_FIELD_display exists

    :param obj: :class:`django.db.models.Model` instance
    :param field: :class:`django.db.models.Field` instance or ``basestring`` fieldname
    :param usedisplay: boolean if True return the get_FIELD_display() result
    :return: field value

    >>> from django.contrib.auth.models import Permission
    >>> p = Permission(name='perm')
    >>> print get_field_value(p, 'name')
    perm

    """
    if isinstance(field, six.string_types):
        fieldname = field
    elif isinstance(field, models.Field):
        fieldname = field.name
    else:
        raise ValueError('Invalid value for parameter `field`: Should be a field name or a Field instance ')

    if usedisplay and hasattr(obj, 'get_%s_display' % fieldname):
        value = getattr(obj, 'get_%s_display' % fieldname)()
    else:
        value = getattr_or_item(obj, fieldname)

    if not raw_callable and callable(value):
        return value()

    return value
