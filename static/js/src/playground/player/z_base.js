class Player extends AcGameObject {
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
}