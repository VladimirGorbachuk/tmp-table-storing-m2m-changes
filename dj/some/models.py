from django.db import models
from django.contrib.auth.models import User, Group

# Create your models here.
class TmpGroupForFillingWithUsers(models.Model):
    """
    temporary table related to user, unique by user, we store only while user needs it
    """
    users = models.ManyToManyField(User)
    author = models.OneToOneField(User, related_name="author_user", on_delete=models.CASCADE, unique=True, null=False, blank=False)
