from django.db.models.signals import post_save
from clothstream.collection.signals import create_initial_collection
from clothstream.tests.fixture_lib import nextname
from clothstream.user_profile.models import UserProfile


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
