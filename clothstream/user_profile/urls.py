from clothstream.lib.rest import SharedAPIRootRouter
from .views import UserProfileListRetrieve, UserProfileUpdate

router = SharedAPIRootRouter()
router.register(r'userprofile/update', UserProfileUpdate, base_name='userprofile-update')
router.register(r'userprofile', UserProfileListRetrieve, base_name='userprofile')
