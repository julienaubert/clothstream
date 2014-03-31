from clothstream.lib.rest import SharedAPIRootRouter
from .views import CollectionCreate, CollectionUpdate, CollectionListRetrieve, CollectionDestroy

router = SharedAPIRootRouter()
router.register(r'collections/create', CollectionCreate, base_name='collection-create')
router.register(r'collections/update', CollectionUpdate, base_name='collection-update')
router.register(r'collections/delete', CollectionDestroy, base_name='collection-delete')
router.register(r'collections', CollectionListRetrieve)
