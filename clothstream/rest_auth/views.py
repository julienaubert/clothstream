from django.contrib.auth import login
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from social.apps.django_app.utils import strategy, load_strategy
from clothstream.rest_auth.serializers import LoginSerializer
from clothstream.social_fb import api as social_fb_api
from django.contrib.auth import logout


@csrf_exempt
@api_view(['POST'])
@permission_classes((permissions.IsAuthenticated,))
def user_logout(request):
    logout(request)
    return Response()


@csrf_exempt
@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
@strategy()
def register_by_access_token(request, backend):
    access_token = request.DATA.get('access_token', None)
    if not access_token:
        return Response("missing access_token", status=400)
    try:
        user = request.strategy.backend.do_auth(access_token=access_token)
    except Exception as err:
        return Response(str(err), status=400)
    if user:
        social_fb_api.enrich_via_facebook(user)
        strategy = load_strategy(request=request, backend=backend)
        login(strategy.request, user)
        serializer = LoginSerializer(instance=user, context={'request': request})
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    else:
        return Response("Bad Credentials", status=403)


@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def get_csrf_cookie(request):
    """ we serve index.html as static file, single-page app must get csrf cookie prior to login, this is how
    """
    return Response()
