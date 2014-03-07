from rest_framework import serializers


class HyperlinkedFileField(serializers.FileField):
    def to_native(self, value):
        request = self.context.get('request', None)
        return request.build_absolute_uri(value.url)
