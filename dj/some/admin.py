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
        super().save_model(request, obj, form, change)
        obj.user_set.set(tmp_selected.users.all())
        tmp_selected.delete()

    def get_form(self, request, obj=None, **kwargs):
        if request.method == 'GET':
            current_user = request.user
            tmp_selected, _ = TmpGroupForFillingWithUsers.objects.get_or_create(author=current_user)
            if obj:
                tmp_selected.users.set(User.objects.filter(groups=obj))
        return super().get_form(request, obj, **kwargs)