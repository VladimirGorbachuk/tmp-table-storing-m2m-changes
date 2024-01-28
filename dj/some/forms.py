from django import forms
from django.contrib.auth.models import Group, User
from django.contrib.admin.widgets import FilteredSelectMultiple


class GroupModelForm(forms.ModelForm):
    template_name = "custom_transfer_form.html"

    class Meta:
        model = Group
        fields = "__all__"