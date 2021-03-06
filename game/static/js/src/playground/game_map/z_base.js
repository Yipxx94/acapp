class GameMap extends AcGameObject {
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
}