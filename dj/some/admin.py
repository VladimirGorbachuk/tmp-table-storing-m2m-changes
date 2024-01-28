from django.contrib import admin
from django.contrib.auth.models import User, Group

from .forms import GroupModelForm
from .models import TmpGroupForFillingWithUsers

admin.site.unregister(Group)


@admin.register(Group)
class GroupNewAdmin(admin.ModelAdmin):
    form = GroupModelForm
    change_form_template = "admin/custom_transfer_form.html"

    def save_model(self, request, obj, form, change):
        current_user = request.user
        tmp_selected = TmpGroupForFillingWithUsers.objects.get(author=current_user)
        print("users", tmp_selected.users.all()[:10])
        print("what is with obj", obj)
        super().save_model(request, obj, form, change)
        for user in tmp_selected.users.all():
            user.groups.add(obj)
        tmp_selected.delete()
