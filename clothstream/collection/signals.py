from django.db.models.signals import post_save
from django.dispatch import receiver
from clothstream.user_profile.models import UserProfile


@receiver(post_save, sender=UserProfile)
def create_initial_collection(sender, created, instance, **kwargs):
    from clothstream.collection.models import Collection
    if created:
        Collection.objects.create(owner=instance, title=u'My first collection')
