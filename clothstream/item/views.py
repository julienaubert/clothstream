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

    def filter_queryset(self, queryset):
        params = {k: self.request.QUERY_PARAMS.get(k) for k in self.request.QUERY_PARAMS}
        if 'max_price' in params and params['max_price'] == 'max':
            params.pop('max_price')
        qs = queryset
        if 'min_price' in params:
            qs = qs.filter(price__gte=params['min_price'])
        if 'max_price' in params:
            qs = qs.filter(price__lte=params['max_price'])
        return super().filter_queryset(qs)
