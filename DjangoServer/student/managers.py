from django.db import models


class UsersManager(models.Manager):
    def get_by_natural_key(self, email):
        return self.get(email=email)
