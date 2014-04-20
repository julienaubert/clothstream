from rest_framework import serializers
from rest_framework.routers import SimpleRouter, DefaultRouter


class HyperlinkedFileField(serializers.FileField):
    def to_native(self, value):
        if value:
            request = self.context.get('request')
            return request.build_absolute_uri(value.url)
        else:
            return ''


class ConsoleDebug():
    def process_response(self, request, response):
        print("\n=== REQUEST PROCESSED ===")
        for key in ['user', 'path', 'method', 'COOKIES']:
            if hasattr(request, key):
                print("request." + key, ":", getattr(request, key))

        def http_headers():
            headers = dict()
            for k, v in request.META.items():
                if k.startswith('HTTP_'):
                    headers[k[5:]] = v
                elif k in ['CONTENT_LENGTH', 'CONTENT_TYPE']:
                    headers[k] = v
            return headers

        print("headers:")
        for k, v in http_headers().items():
            print("\t {}: {}".format(k, v))

        for key in ['data', 'status_code', 'reason_phrase', 'cookies']:
            if hasattr(response, key):
                if key == 'data':
                    print("response." + key, ":", str(getattr(response, key))[:50])
                else:
                    print("response." + key, ":", getattr(response, key))

        return response


class SharedAPIRootRouter(SimpleRouter):
    common_api = DefaultRouter()

    def register(self, *args, **kwargs):
        self.common_api.register(*args, **kwargs)
        super().register(*args, **kwargs)

