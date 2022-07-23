class AcGamePlayground {
    constructor(root) {
        this.root = root;
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

    start() {
        let outer = this;
        $(window).resize(function() {    // 监听窗口大小改变的事件
            outer.resize();
        });
    }

    resize() {    // 联机对战，保持窗口16:9的比例不变
        console.log("resize");
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;    // 基准

        if (this.game_map)
            this.game_map.resize();
    }

    show() {    // 打开 playground 界面
        this.$playground.show();

        this.resize();

        // 将地图的长和宽存下来
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, true));

        for (let i = 0; i < 9; i ++ )
        {
            this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, false));
        }
    }

    hide() {    // 关闭 playground 界面
        this.$playground.hide();
    }
}
