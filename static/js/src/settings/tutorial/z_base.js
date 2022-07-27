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
            console.log("click back");
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
}