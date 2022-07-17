class AcGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-filed">
        <div class="ac-game-menu-filed-item ac-game-menu-filed-item-single-mode">
            单人模式
        </div>
        </br>
        <div class="ac-game-menu-filed-item ac-game-menu-filed-item-multi-mode">
            多人模式
        </div>
        </br>
        <div class="ac-game-menu-filed-item ac-game-menu-filed-item-tutorial">
            操作说明
        </div>
        </br>
        <div class="ac-game-menu-filed-item ac-game-menu-filed-item-settings">
            设置
        </div>
    </div>
</div>
`);    // 创建一个HTML对象，menu
        this.root.$ac_game.append(this.$menu);
        // 添加按钮
        this.$single_mode = this.$menu.find('.ac-game-menu-filed-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-filed-item-multi-mode');
        this.$tutorial = this.$menu.find('.ac-game-menu-filed-item-tutorial');
        this.$settings = this.$menu.find('.ac-game-menu-filed-item-settings');
        // 对象刚创建出来就会调用这个 start 函数
        this.start();
    }
    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function () {
            console.log("click multi mode");
        });
        this.$tutorial.click(function () {
            console.log("click tutorial mode");
        });
        this.$settings.click(function () {
            console.log("click settings mode");
        });
    }

    show() {    // 显示 menu 界面
        this.$menu.show();
    }

    hide() {    // 关闭 menu 界面
        this.$menu.hide();
    }
}