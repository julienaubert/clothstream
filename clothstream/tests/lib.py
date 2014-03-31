def from_db(instance):
    return instance.__class__.objects.get(pk=instance.pk)
