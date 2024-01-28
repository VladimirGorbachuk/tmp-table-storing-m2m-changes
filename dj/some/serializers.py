from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .models import TmpGroupForFillingWithUsers


class UserIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']


class UserSerializer(serializers.ModelSerializer):
    is_selected = serializers.BooleanField(default=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'is_active', 'is_selected']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'url', 'name']


class TmpGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = TmpGroupForFillingWithUsers
        fields = ['id', "group", "author", "users"]


class UserIdsSerializer(serializers.Serializer):
    selected_ids = serializers.ListField(child = serializers.IntegerField())
    
    def add_to_group(self, tmp_group: TmpGroupForFillingWithUsers):
        for pk in self.validated_data["selected_ids"]:
            user_to_add = User.objects.get(pk=pk)
            tmp_group.users.add(user_to_add)
    
    def remove_from_group(self, tmp_group: TmpGroupForFillingWithUsers):
        for pk in self.validated_data["selected_ids"]:
            user_to_remove = User.objects.get(pk=pk)
            tmp_group.users.remove(user_to_remove)
