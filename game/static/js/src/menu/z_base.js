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
}