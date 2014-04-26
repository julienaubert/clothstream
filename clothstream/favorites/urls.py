from clothstream.lib.rest import SharedAPIRootRouter
from .views import FavoritedItemCreate, FavoritedItemDestroy

router = SharedAPIRootRouter()
router.register(r'favorite-item/create', FavoritedItemCreate, base_name='favoriteditem-create')
router.register(r'favorite-item/delete', FavoritedItemDestroy, base_name='favoriteditem-delete')
