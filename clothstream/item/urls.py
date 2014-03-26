from clothstream.lib.rest import SharedAPIRootRouter
from .views import ItemViewSet

router = SharedAPIRootRouter()
router.register(r'items', ItemViewSet)
