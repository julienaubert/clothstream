from itertools import count
from django.db.models.signals import post_save
from clothstream.collection.signals import create_initial_collection
from clothstream.user_profile.models import UserProfile


def subargs(kwargs, prefix):
    prefix = "{}__".format(prefix)
    ret = {key[len(prefix):]: kwargs.pop(key) for key in kwargs.keys() if key.startswith(prefix)}
    return ret


def nextname(prefix, counters={}):
    if prefix not in counters:
        counters[prefix] = count()
    return "{0}-{1}".format(prefix, next(counters[prefix]))


def user_factory(skip_initial_collection=True, **kwargs):
    # note: collections.signals creates a collection on post-save user, this factory skips that signal by default
    if 'username' not in kwargs:
        kwargs['username'] = nextname('User')

    if skip_initial_collection:
        post_save.disconnect(create_initial_collection, sender=UserProfile)
    user = UserProfile.objects.create(**kwargs)
    if skip_initial_collection:
        post_save.connect(create_initial_collection, sender=UserProfile)

    return user
