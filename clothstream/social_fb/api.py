from django.core.files.base import ContentFile
from facebook import GraphAPI


def enrich_via_facebook(user):
    social_user = user.social_auth.filter(provider='facebook').first()
    if not social_user:
        return
    fb_api = GraphAPI(social_user.extra_data['access_token'])
    fb_uid = social_user.extra_data['id']
    picture = fb_api.get_object('{}/picture?type=large'.format(fb_uid))
    user.picture.save(name=None, content=ContentFile(picture['data']), save=False)
    avatar = fb_api.get_object('{}/picture?type=small'.format(fb_uid))
    user.avatar.save(name=None, content=ContentFile(avatar['data']), save=False)
    user.save()
