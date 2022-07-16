from django.shortcuts import render # 渲染html文件

def index(request):
    return render(request, "multiterminal/web.html")