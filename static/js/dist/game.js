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
            设置
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
            outer.root.playground.show();
        });
        this.$multi_mode.click(function() {
            console.log("click multi mode");
        });
        this.$tutorial.click(function() {
            console.log("click tutorial mode");
        });
        this.$settings.click(function() {
            console.log("click settings mode");
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
    }

    start() {    // 只会在第一帧执行

    }

    update() {    // 每一帧都会执行一次

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
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);class GameMap extends AcGameObject {
    constructor(playground) {
        super();    // 调用基类的构造函数
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);    // 创建画布
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playground.append(this.$canvas);    // 将画布加到 playground
    }

    start() {

    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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

        this.eps = 0.1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        this.friction = 0.9;

        this.invincible_time = 0;

        this.eps = 0.1;    // 精度

        this.cur_skill = null;    // 当前选择的技能

        // 在自己的圆上画头像
        if (this.is_me)
        {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me)
            this.add_listening_events();
        else
        {
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {    // 关闭画布上的鼠标监听右键
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();    // 画布左上角
            if (e.which === 3)    // 鼠标右键
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            else if (e.which === 1)    // 鼠标左键
            {
                if (outer.cur_skill === "fireball")
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);

                outer.cur_skill = null;
            }
        });

        $(window).keydown(function(e) {
            if (e.which === 81)    // keycode 事件：q 键
            {
                outer.cur_skill = "fireball";
                return false;    // 表示后续不处理了
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x, y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1;

        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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
        if (this.radius < 10)
        {
            this.destroy();
            return false;
        }
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 90;
        this.speed *= 1.25;
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
        if (this.invincible_time > 3 && Math.random() < 1 / 300.0)
        {
            let player = this.get_random_player();
            if (!this.is_me)
            {
                let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
                let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
                this.shoot_fireball(tx, ty);
            }
        }
        if (this.damage_speed > 10)
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
                if (!this.is_me)
                {
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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

        this.render();
    }

    render() {
        if (this.is_me)
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
            }
        }
    }
}class FireBall extends AcGameObject {
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

        this.eps = 0.1;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player))
            {
                this.attack(player);
                break;
            }
        }

        this.render();
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
        this.destroy();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`
<div class="ac-game-playground">
</div>
`);

        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ["red", "orange", "yellow", "green", "blue", "pink", "purple", "grey", "golden"];
        return colors[Math.floor(Math.random() * 9)];
    }

    start() {

    }

    show() {    // 打开 playground 界面
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        // 将地图的长和宽存下来
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 9; i ++ )
        {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
    }

    hide() {    // 关闭 playground 界面
        this.$playground.hide();
    }
}
class Settings {
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
        <div class="ac-game-settings-acwing">
            <img width="35" src="https://app2848.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            </br>
            </br>
            <div> AcWing 一键登录 </div>
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
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button> 注册 </button>
            </div>
        </div>
        </br>
        <div class="ac-game-settings-option">
            登录
        </div>
        </br>
        <div class="ac-game-settings-acwing">
            <img width="35" src="https://app2848.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            </br>
            </br>
            <div> AcWing 一键登录 </div>
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

        this.root.$ac_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
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
//            url: "https://app2848.acapp.acwing.com.cn/settings/login",
            url: "https://www.game.yexxweb.com/settings/login",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(resp) {
                console.log(resp);
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
            url: "https://www.game.yexxweb.com/settings/register",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success")
                    location.reload();
                else
                    outer.$register_error_message.html(resp.result);
            }
        })
    }

    logout_on_remote() {    // 在远程服务器上登出
        if (this.platform === "ACAPP")
            return false;

        $.ajax({
            url: "https://www.game.yexxweb.com/settings/logout",
            type: "GET",
            success: function(resp) {
                console.log(resp);
                if (resp.result === "success")
                    location.reload();
            }
        })
    }

    register() {    // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {    // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    getinfo() {
        let outer = this;

        $.ajax({    // 从浏览器向服务器发送一个请求
//            url: "https://app2848.acapp.acwing.com.cn/settings/getinfo",
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

        this.start();
    }

    start() {

    }
}