import AbstractView from "./AbstractView.js";
import Config from "../config.js"

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Đăng nhập");
    }

    async getHtml() {
        return `
        <div class="login-container">
            <div class="container">
                <form class="form" id="login">
                    <h1 class="form__title">Đăng nhập hệ thống</h1>
                    <div class="form__message form__message--error">
                        <!-- Incorrect username or password -->
                    </div>
        
                    <div class="form__input-group">
                        <input type="text" class="form__input" name="username-field" autofocus placeholder="Mã sinh viên hoặc email">
                        <div class="form__input-error-message"></div>
                    </div>
        
                    <div class="form__input-group">
                        <input type="password" name="password-field" class="form__input" autofocus placeholder="Mật khẩu">
                    </div>
        
                    <button class="form__button login-button" type="submit">Đăng nhập</button>
                </form>
            </div>
        </div>
        `;
    }

    initialize() {
        if (this.isLoggedIn()) {
            window.location.href = "/dashboard";
            return;
        } 
        const form = document.querySelector("#login");
        form.addEventListener('submit', async e => {
            e.preventDefault();
            let formdata = new FormData(form);
            const username = formdata.get('username-field');
            const password = formdata.get('password-field');

            const rawResponse = await fetch(`${Config.API_URL}/login`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            const content = await rawResponse.json();
            console.log(content);
            if (!rawResponse.ok) {
                form.querySelector(".form__message--error").innerHTML = content['message'];
            } else {
                localStorage.setItem('token', content['token']);
                localStorage.setItem('email', content['email']);
                localStorage.setItem('info', JSON.stringify(content['info']));
                location.href = '/dashboard';
            }
        })
    }
}