from django.conf import settings
from rest_framework import serializers


class HyperlinkedFileField(serializers.FileField):
    def to_native(self, value):
        request = self.context.get('request', None)
        return request.build_absolute_uri(value.url)


class AllowAllCrossOrigin():
    """ allows cross-origin - only if settings.DEBUG
    (useful if front-end/back-end does not have same origin during development)
    """
    def process_response(self, request, response):
        if settings.DEBUG:
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
            response["Access-Control-Max-Age"] = "1000"
            response["Access-Control-Allow-Headers"] = "*"
        return response
