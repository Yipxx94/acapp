from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):    # 接受一个连接
        self.room_name = None

        for i in range(1000):    # 枚举每个房间，暂定共有1000个房间
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

        await self.accept()
#        print('accept')

        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)    # 每局游戏有效期1小时

        for player in cache.get(self.room_name):    # 向建立连接的web端发送房间内其他玩家信息
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

#        self.room_name = "room"
        await self.channel_layer.group_add(self.room_name, self.channel_name)    # 将很多不同的连接放到一个组里

    async def disconnect(self, close_code):    # 客户端关闭时，断开连接（不一定执行）
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': ['photo'],
        })
        cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(    #将消息发送给组里的所有人
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )

    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
#        print(data)