from django.urls import include, path
from rest_framework import routers

from .views import UserViewSet, GroupViewSet, TmpGroupViewSet, add_user_ids, remove_user_ids, TmpSelectedUserViewSet


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'selected_users', TmpSelectedUserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'tmp_group', TmpGroupViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("add_users_to_tmp/", add_user_ids),
    path('remove_users_from_tmp/', remove_user_ids),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns += router.urls