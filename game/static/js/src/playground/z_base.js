class AcGamePlayground {
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
