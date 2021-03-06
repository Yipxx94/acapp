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
}