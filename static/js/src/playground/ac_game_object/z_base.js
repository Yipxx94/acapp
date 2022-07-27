let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;    // 是否执行过 start 函数
        this.timedelta = 0;    // 两帧之间的时间间隔

        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ )
        {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() {    // 只会在第一帧执行

    }

    update() {    // 每一帧都会执行一次

    }

    late_update() {    // 在每一帧的最后执行一次

    }

    on_destroy() {    // 在被销毁前执行一次

    }
    destroy() {    // 删除当前物体
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
        {
            if (AC_GAME_OBJECTS[i] === this)
            {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

// 每一帧都执行这个函数
let AC_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < AC_GAME_OBJECTS.length; i++)
    {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
        {
            let obj = AC_GAME_OBJECTS[i];
            obj.late_update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);