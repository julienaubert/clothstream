from django.conf import settings
from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer


class ItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Item to be viewed or edited.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    paginate_by = 5
    paginate_by_param = 'page_size'
    max_paginate_by = 100

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if settings.DEBUG:
            # TODO: add as middleware
            # so we can have django localhost:8000 and brunchwatch on localhost:3333
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
            response["Access-Control-Max-Age"] = "1000"
            response["Access-Control-Allow-Headers"] = "*"
        return response
