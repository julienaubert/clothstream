from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic.base import TemplateView
from django.conf import settings
from clothstream.lib.paths import PROJECT_DIR
from clothstream.lib.rest import SharedAPIRootRouter


admin.autodiscover()


def api_urls():
    from importlib import import_module
    for app in settings.INSTALLED_APPS:
        try:
            import_module(app + '.urls')
        except (ImportError, AttributeError):
            pass
    return SharedAPIRootRouter.common_api.urls


urlpatterns = patterns(
    '',
    url(r'^$', TemplateView.as_view(template_name='base.html')),
    url(r'^api/', include(api_urls())),
    url(r'^api/', include('clothstream.auth.urls')),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url('', include('social.apps.django_app.urls', namespace='social'))
)


if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns(
        '',
        url(r'^__debug__/', include(debug_toolbar.urls)),
        url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    ) + (
       static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) +
       static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) +
       static('/', document_root=str(PROJECT_DIR/'frontend'/'public'))
    )
