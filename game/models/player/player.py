from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):    # 要从 models.Model 这个类来继承
    # Player 从 User 扩充，这里是定义一个扩充关系，代表 Player 都有唯一对应的 User
    # User 就是代表 User 数据表，on_delete 代表删除User的时候，把他对应的 Player 也删掉
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=256, blank=True)
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    score = models.IntegerField(default=1500)

    def __str__(self):    # 显示在 admin 界面（返回一个对象的描述信息）
        return str(self.user)