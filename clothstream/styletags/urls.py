from clothstream.lib.rest import SharedAPIRootRouter
from .views import ItemStyleTagCreate, StyleTagList

router = SharedAPIRootRouter()
router.register(r'styletag-item/create', ItemStyleTagCreate, base_name='itemstyletag-create')
router.register(r'styletags', StyleTagList)
