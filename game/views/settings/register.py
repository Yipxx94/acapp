from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", " ").strip()    # 去掉头尾空格
    password = data.get("password", " ").strip()
    password_confirm = data.get("password_confirm", " ").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "输入的两次密码不一致"
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://img2.woyaogexing.com/2021/01/24/387f48634896405294c75ec0b38ed177!400x400.jpeg")
    login(request, user)
    return JsonResponse({
        'result': "success"
    })