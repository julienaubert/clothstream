from django.conf.urls import patterns, url
from clothstream.lib.rest import SharedAPIRootRouter
from .views import register_by_access_token, get_csrf_cookie

urlpatterns = patterns(
    '',
    url(r'^register/(?P<backend>[^/]+)/', register_by_access_token, name='api.login'),
    url(r'^csrf/', get_csrf_cookie, name='api.csrf_cookie'),
)

router = SharedAPIRootRouter()
