from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_initial_collection(sender, created, instance, **kwargs):
    from clothstream.collection.models import Collection
    if created:
        Collection.objects.create(owner=instance, title=u'My first collection')
