from django import forms
from django.contrib.auth.models import Group, User
from django.contrib.admin.widgets import FilteredSelectMultiple


class GroupModelForm(forms.ModelForm):
    template_name = "custom_transfer_form.html"
    users = forms.ModelMultipleChoiceField(
        queryset=User.objects.all(),
        widget=FilteredSelectMultiple("verbose name", is_stacked=False),
    )

    class Meta:
        model = Group
        fields = "__all__"