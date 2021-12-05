from django.http import HttpResponse

# Create your views here.

def index(request):
#    line1 = '<h1 style = "text-align: center">术士之战</h1>'
#    line2 = '<image src = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg.52miji.com%2Fimage%2F2016%2F09%2F23%2F884153f8ac6389f374f436f13ca52db4.jpg&refer=http%3A%2F%2Fimg.52miji.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641313520&t=0cf9957d2bbb91d5295a6b8cd1150e5d">'
    
    line1 = '<h1 style = "text-align: center">王者荣耀</h1>'
    line2 = '<image src = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F201703%2F07%2F20170307105658_5Uzjn.jpeg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1641313837&t=c079cb7f9900a15002a7347970a4db34">'
    return HttpResponse(line1 + line2)
