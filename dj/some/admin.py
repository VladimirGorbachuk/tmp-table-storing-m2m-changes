from django.contrib import admin
from django.contrib.auth.models import User, Group

from .forms import GroupModelForm


admin.site.unregister(Group)


@admin.register(Group)
class GroupNewAdmin(admin.ModelAdmin):
    form = GroupModelForm
    change_form_template = "admin/custom_transfer_form.html"
