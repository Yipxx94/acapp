class GameMap extends AcGameObject {
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
}