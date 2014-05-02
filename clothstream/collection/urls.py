from clothstream.lib.rest import SharedAPIRootRouter
from .views import CollectionCreate, CollectionUpdate, CollectionListRetrieve, CollectionDestroy, \
    CollectedItemDestroy, CollectedItemCreate

router = SharedAPIRootRouter()
router.register(r'collections/create', CollectionCreate, base_name='collection-create')
router.register(r'collections/update', CollectionUpdate, base_name='collection-update')
router.register(r'collections/delete', CollectionDestroy, base_name='collection-delete')
router.register(r'collections', CollectionListRetrieve)
router.register(r'collecteditem/create', CollectedItemCreate, base_name='collecteditem-create')
router.register(r'collecteditem/delete', CollectedItemDestroy, base_name='collecteditem-delete')
