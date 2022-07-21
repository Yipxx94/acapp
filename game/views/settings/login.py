from django.http import JsonResponse
from django.contrib.auth import authenticate, login    # 验证密码是否正确

def signin(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)    # 比较哈希值
    if not user:
        return JsonResponse({
            'result': "用户名或密码不正确"
        })
    login(request, user)
    return JsonResponse({
        'result': "success"
    })
