from django.contrib.auth.models import Group, User
from rest_framework import permissions, viewsets
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import TmpGroupForFillingWithUsers
from .serializers import GroupSerializer, TmpGroupSerializer, UserIdsSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class TmpSelectedUserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tmp_model, _  = TmpGroupForFillingWithUsers.objects.get_or_create(author=user)
        return tmp_model.users.all()


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class TmpGroupViewSet(viewsets.ModelViewSet):
    queryset = TmpGroupForFillingWithUsers.objects.all()
    serializer_class = TmpGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return []

        user = self.request.user
        result, _  = self.queryset.get_or_create(author=user)
        return [result]


@api_view(['POST'])
def add_user_ids(request):
    """
    List all code snippets, or create a new snippet.
    """
    user = request.user
    tmp_group, _  = TmpGroupForFillingWithUsers.objects.get_or_create(author=user)
    serializer = UserIdsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.add_to_group(tmp_group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def remove_user_ids(request):
    """
    List all code snippets, or create a new snippet.
    """

    user = request.user
    tmp_group, _  = TmpGroupForFillingWithUsers.objects.get_or_create(author=user)
    serializer = UserIdsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.remove_from_group(tmp_group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

