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
        # TODO: do it http://www.django-rest-framework.org/api-guide/filtering
        params = {k: self.request.QUERY_PARAMS.get(k) for k in self.request.QUERY_PARAMS}
        qs = queryset
        if 'min_price' in params:
            qs = qs.filter(price__gte=params['min_price'])
        if 'max_price' in params:
            qs = qs.filter(price__lte=params['max_price'])
        if 'colors' in params:
            params['colors'] = [int(c) for c in params['colors'] if c.isdigit()]
            if len(params['colors']):
                qs = qs.filter(color__in=params['colors'])
        return super().filter_queryset(qs)
