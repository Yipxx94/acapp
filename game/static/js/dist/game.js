class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-tutorial">
            操作说明
        </div>
        </br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出
        </div>
    </div>
</div>
`);    // 创建一个HTML对象，menu
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);

        // 添加按钮
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$tutorial = this.$menu.find('.ac-game-menu-field-item-tutorial');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        // 对象刚创建出来就会调用这个 start 函数
        this.start();

    }
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function() {
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function() {
            outer.hide();
            outer.root.playground.show("multi mode");
        });
        this.$tutorial.click(function() {
            outer.$menu.hide();
            outer.root.tutorial.show();
        });
        this.$settings.click(function() {
            outer.root.settings.logout_on_remote();
        });
    }

    show() {    // 显示 menu 界面
        this.$menu.show();
    }

    hide() {    // 关闭 menu 界面
        this.$menu.hide();
    }
}let AC_GAME_OBJECTS = [];

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

requestAnimationFrame(AC_GAME_ANIMATION);class ChatField {    // 不是画在canvas画布上，所以不需要继承自游戏对象
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history"></div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27)    // esc
            {
                outer.hide_input();
                return false;
            }
            else if (e.which === 13)    // enter
            {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text)
                {
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);    // 向服务器发送消息事件
                }
                return false;    // 表示回车按键不向上传递
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`)
    }

    add_message(username, text) {
        this.show_history();
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    show_history() {
        let outer = this;
        this.$history.fadeIn();    // 慢慢出来

        if (this.func_id)
            clearTimeout(this.func_id);

        this.func_id = setTimeout(function() {
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);    // 3s 后关闭
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }

}class GameMap extends AcGameObject {
    constructor(playground) {
        super();    // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);    // 创建画布
        this.$music=$(`<audio src="https://www.game.yexxweb.com/static/audio/bgMusic.mp3" loop="loop" autoplay="autoplay">`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playground.append(this.$canvas);    // 将画布加到 playground
        $("head").append(this.$music);
        this.music_play();
    }

    start() {
        this.$canvas.focus();    // 聚焦
    }

    music_play() {
        this.$music[0].play();
    }

    music_stop() {
        this.$music[0].pause();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }
}class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;

        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";

        this.start();
    }

    start() {

    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px 楷体";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
    }
}class Particle extends AcGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;

        this.eps = 0.01;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps || this.speed < this.eps)
        {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;

        this.render();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;    // x 方向的速度
        this.vy = 0;    // y 方向的速度
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;    // 移动距离
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.friction = 0.9;

        this.username = username;
        this.photo = photo;

        // 将每个玩家发的子弹存下来
        this.fireballs = [];

        this.invincible_time = 0;

        this.eps = 0.01;    // 精度

        this.cur_skill = null;    // 当前选择的技能

        // 在自己的圆上画头像
        if (this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }

        // 添加技能冷却
        if (this.character === "me")
        {
            this.fireball_coldtime = 3;    // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.flash_coldtime = 6;    // 单位：秒
            this.flash_img = new Image();
            this.flash_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        this.playground.player_cnt ++ ;
        this.playground.notice_board.write("已就绪" + this.playground.player_cnt + "人");

        if (this.playground.player_cnt >= 3)
        {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me")
            this.add_listening_events();
        else if (this.character === "robot")
        {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {    // 关闭画布上的鼠标监听右键
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.playground.state !== "fighting")
                return true;    // 不阻断该信息

            const rect = outer.ctx.canvas.getBoundingClientRect();    // 画布左上角
            if (e.which === 3)    // 鼠标右键
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                // 如果当前是多人模式，就将当前操作传到服务器并广播
                if (outer.playground.mode == "multi mode")
                    outer.playground.mps.send_move_to(tx, ty);
            }
            else if (e.which === 1)    // 鼠标左键
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;

                if (outer.cur_skill === "fireball")
                {
                    if (outer.fireball_coldtime > outer.eps)    // 火球技能还没冷却好
                        return false;

                    let fireball = outer.shoot_fireball(tx, ty);

                    if (outer.playground.mode === "multi mode")
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                }
                else if (outer.cur_skill === "flash")
                {
                    if (outer.flash_coldtime > outer.eps)    // 闪现技能还没冷却好
                        return false;
                    outer.flash(tx, ty);

                    if (outer.playground.mode === "multi mode")
                        outer.playground.mps.send_flash(tx, ty);
                }

                outer.cur_skill = null;
            }
        });

        this.playground.game_map.$canvas.keydown(function(e) {
            if (e.which === 13)    // enter 键
            {
                if (outer.playground.mode === "multi mode")    // 打开聊天框
                {
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            else if (e.which === 27)    // esc 键
            {
                if (outer.playground.mode === "multi mode")
                {
                    outer.playground.chat_field.hide_input();
                    return false;
                }
            }
            if (outer.playground.state !== "fighting")
                return true;

            if (e.which === 81)    // keycode 事件：q 键
            {
                if (outer.fireball_coldtime > outer.eps)    // 火球技能还没冷却好
                    return true;

                outer.cur_skill = "fireball";
                return false;    // 表示后续不处理了
            }
            else if (e.which == 70)    // f 键
            {
                if (outer.flash_coldtime > outer.eps)    // 闪现技能还没冷却好
                    return true;
                outer.cur_skill = "flash";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;

        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;

        return fireball;    // 获取发射的子弹的uuid
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i ++ )
        {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid)
            {
                fireball.destroy();
                break;
            }
        }
    }

    flash(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.flash_coldtime = 6;    // 更新技能CD
        this.move_length = 0;    // 闪现完停下来
    }

    be_attacked(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 10; i ++ )
        {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 4;

            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < this.eps)
        {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 90;
        this.speed *= 1.25;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.be_attacked(angle, damage);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    get_random_player() {
        return this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
    }

    update() {    // 每一帧都会执行
        this.invincible_time += this.timedelta / 1000;

        this.update_win();

        if (this.character === "me" && this.playground.state === "fighting")
            this.update_coldtime();

        this.update_move();

        this.render();
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1)
        {
            this.playground.state === "over";
            this.playground.score_board.win();
        }
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.flash_coldtime -= this.timedelta / 1000;
        this.flash_coldtime = Math.max(this.flash_coldtime, 0);
    }

    update_move() {    // 更新玩家移动
        if (this.invincible_time > 3 && Math.random() < 1 / 300.0)
        {
            let player = this.get_random_player();
            if (this.character === "robot")
            {
                let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
                let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
                this.shoot_fireball(tx, ty);
            }
        }
        if (this.damage_speed > this.eps)
        {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else
        {
            if (this.move_length < this.eps)
            {
                this.move_length = 0;
                this.vx = 0;
                this.vy = 0;
                if (this.character === "robot")
                {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else
            {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);    // 每一帧的移动距离
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }
    render() {
        let scale = this.playground.scale;
        if (this.character !== "robot")    // 渲染图片
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, (this.radius * 2) * scale, (this.radius * 2) * scale);
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting")
            this.render_skill_coldtime();
    }

    render_skill_coldtime() {
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, (r * 2) * scale, (r * 2) * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, false);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(192, 192, 192, 0.6)";
            this.ctx.fill();
        }

        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.flash_img, (x - r) * scale, (y - r) * scale, (r * 2) * scale, (r * 2) * scale);
        this.ctx.restore();

        if (this.flash_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.flash_coldtime / 6) - Math.PI / 2, false);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(192, 192, 192, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me")
        {
            if (this.playground.state === "fighting")
            {
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }


        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        this.state = null;  // win: 胜利，lose：失败

        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";

        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";
    }

    start() {

    }

    add_listening_events() {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function() {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win() {
        this.state = "win";

        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1500);
    }

    lose() {
        this.state = "lose";

        let outer = this;
        setTimeout(function() {
            outer.add_listening_events();
        }, 1500);
    }

    late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;
        if (this.state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.state === "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}
class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_lentgh, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;    // x 方向的速度
        this.vy = vy;    // y 方向的速度
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_lentgh;
        this.damage = damage;

        this.eps = 0.01;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps)
        {
            this.destroy();
            return false;
        }

        this.update_move();

        if (this.player.character !== "enemy")
            this.update_attack();

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player))
            {
                this.attack(player);
                break;
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let d = this.get_dist(this.x, this.y, player.x, player.y);
        if (d < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.be_attacked(angle, this.damage);

        if (this.playground.mode === "multi mode")
        {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }

    render() {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {    // 删除fireball之前，将其从player中删掉
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++ )
        {
            if (fireballs[i] === this)
            {
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://www.game.yexxweb.com/wss/multiplayer/");

        this.start();
    }
    start() {
        this.receive();
    }

    receive() {    // 服务器广播后，前端接收信息
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid)
                return false;

            let event = data.event;
            if (event === "create_player")
                outer.receive_create_player(uuid, data.username, data.photo);
            else if (event === "move_to")
                outer.receive_move_to(uuid, data.tx, data.ty);
            else if (event === "shoot_fireball")
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            else if (event === "attack")
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            else if (event === "flash")
                outer.receive_flash(uuid, data.tx, data.ty);
            else if (event === "message")
                outer.receive_message(uuid, data.username, data.text);
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );
        player.uuid = uuid;    // 每一个player的uuid等于创建他的uuid
        this.playground.players.push(player);
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ )
        {
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }
        return null;
    }

    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);

        if (player)
            player.move_to(tx, ty);
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player)
        {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee)
        {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_flash(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "flash",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_flash(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player)
            player.flash(tx, ty);
    }

    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text);
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.scale = 0;
        this.$playground = $(`
<div class="ac-game-playground">
</div>
`);

        this.hide();

        this.root.$ac_game.append(this.$playground);

        this.start();
    }

    get_random_color() {
        let colors = ["red", "orange", "yellow", "green", "blue", "pink", "purple", "grey", "golden"];
        return colors[Math.floor(Math.random() * 9)];
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

    start() {
        let outer = this;
        let uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, function() {    // 监听窗口大小改变的事件
            outer.resize();
        });

        if (this.root.AcWingOS)
        {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uuid}`);
            });
        }
    }

    resize() {    // 联机对战，保持窗口16:9的比例不变
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;    // 基准

        if (this.game_map)
            this.game_map.resize();
    }

    show(mode) {    // 打开 playground 界面
        this.mode = mode;

        let outer = this;
        this.$playground.show();

        this.resize();

        // 将地图的长和宽存下来
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.state = "waiting";    // waiting -> fighting -> over
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_cnt = 0;

        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode")
        {
            for (let i = 0; i < 9; i ++ )
            {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        else if (mode === "multi mode")
        {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function() {    // 当连接创建成功后的回调函数
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }
    }

    hide() {    // 关闭 playground 界面
        while (this.players && this.players.length > 0)
            this.players[0].destroy();

        if (this.game_map)
        {
            this.game_map.music_stop();
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board)
        {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board)
        {
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }
}
class AcGameTutorial {
    constructor(root) {
        this.root = root;
        this.$tutorial = $(`
<div class="ac-game-tutorial" xmlns="http://www.w3.org/1999/html">
    <div class="ac-game-tutorial-title">
        操作说明
    </div>
    <div class="ac-game-tutorial-context">
        鼠标右键：移动
        </br>
        鼠标左键：选择技能释放方向
        </br>
        q：发射火球
        </br>
        f：闪现
        </br>
        enter：聊天框
        </br>
        esc：退出聊天框
    </div>
    </br>
    </br>
    </br>
    </br>
    <div class="ac-game-tutorial-option">
        </br>
        </br>
        </br>
        <button>返回</button>
    </div>  
</div>   
        `);

        this.root.$ac_game.append(this.$tutorial);

        this.$tutorial_back = this.$tutorial.find(".ac-game-tutorial-option button");

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$tutorial_back.click(function() {
            outer.hide();
            outer.root.menu.show();
        });
    }

    show() {
        this.$tutorial.show();
    }

    hide() {
        this.$tutorial.hide();
    }
}class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS)
            this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class = "ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button> 登录 </button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        </br>
        </br>
        <div class="ac-game-settings-option-second">
            更多登录方式：
        </div>
        </br>
        <div class="ac-game-settings-third-login">
            <img width="35" src="https://www.game.yexxweb.com/static/image/settings/acwing_logo.png" class="acwing-login">
            <img width="45" src="https://www.game.yexxweb.com/static/image/settings/qq_logo.png" class="qq-login">
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button> 注册 </button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        </br>
        </br>
        <div class="ac-game-settings-option-second">
            更多登录方式：
        </div>
        </br>
        <div class="ac-game-settings-third-login">
            <img width="35" src="https://www.game.yexxweb.com/static/image/settings/acwing_logo.png" class="acwing-login">
            <img width="45" src="https://www.game.yexxweb.com/static/image/settings/qq_logo.png" class="qq-login">
        </div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find('.acwing-login');
        this.$qq_login = this.$settings.find('.qq-login');

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        if (this.platform == "ACAPP")
            this.getinfo_acapp();
        else
        {
            this.getinfo_web();
            this.add_listening_events();
        }
    }

    add_listening_events() {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(function() {
            outer.acwing_login();
        });

        this.$qq_login.click(function() {
            outer.qq_login();
        });
    }

    acwing_login() {
        $.ajax({
           url: "https://www.game.yexxweb.com/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp) {
               if (resp.result === "success")
                   window.location.replace(resp.apply_code_url);    // 将当前页面重定向
            }
        });
    }

    qq_login() {
        $.ajax({
            url : "https://www.game.yexxweb.com/settings/qq/apply_code/",
            type : "GET",
            success : function(resp) {
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        })
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function() {
            outer.register();
        });

        this.$login_submit.click(function() {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function() {
            outer.login();
        });

        this.$register_submit.click(function() {
            outer.register_on_remote();
        });
    }

    login_on_remote() {    // 在远程服务器登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
//            url: "https://app2848.acapp.acwing.com.cn/settings/login/",
            url: "https://www.game.yexxweb.com/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                if (resp.result === "success")
                    location.reload();
                else
                    outer.$login_error_message.html(resp.result);
            }
        });
    }

    register_on_remote() {    // 在远程服务器注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://www.game.yexxweb.com/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                if (resp.result === "success")
                    location.reload();
                else
                    outer.$register_error_message.html(resp.result);
            }
        });
    }

    logout_on_remote() {    // 在远程服务器上登出
        if (this.platform === "ACAPP")
        {
            this.root.AcWingOS.api.window.close();
        }
        else if (this.platform === "WEB")
        {
            $.ajax({
                url: "https://www.game.yexxweb.com/settings/logout/",
                type: "GET",
                success: function(resp) {
                    if (resp.result === "success")
                        location.reload();
                }
            });
        }
    }

    register() {    // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {    // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success")
            {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    getinfo_acapp() {
        let outer = this;
        $.ajax({
            url: "https://www.game.yexxweb.com/settings/acwing/acapp/apply_code",
            type: "GET",
            success: function(resp) {
                if (resp.result == "success")
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
            }
        });
    }

    getinfo_web() {
        let outer = this;

        $.ajax({    // 从浏览器向服务器发送一个请求  服务器获取该请求的相关信息
//            url: "https://app2848.acapp.acwing.com.cn/settings/getinfo",
            url: "https://www.game.yexxweb.com/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {    // 请求之后的服务器的返回响应
                if (resp.result == "success")    // 如果登录成功
                {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();    // 隐藏这个登录界面
                    outer.root.menu.show();    // 打开菜单界面
                }
                else
                {
                    outer.login();    // 如果没有登录就打开登录界面
                }
            }
        });

/*        $.ajax({    // 从浏览器向服务器发送一个请求
            url: "https://www.game.yexxweb.com/settings/getinfo",
            type: "GET",
            data: {
                platform: outer.platform,
            },
            success: function(resp) {    // 请求之后的服务器的返回响应
                console.log(resp);
                if (resp.result == "success")    // 如果登录成功
                {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();    // 隐藏这个登录界面
                    outer.root.menu.show();    // 打开菜单界面
                }
                else
                {
                    outer.login();    // 如果没有登录就打开登录界面
                }
            }
        });
 */
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}export class AcGame {
    constructor(id, AcWingOS) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        this.tutorial = new AcGameTutorial(this);

        this.start();
    }

    start() {

    }
}