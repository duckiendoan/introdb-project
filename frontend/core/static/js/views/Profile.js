import AbstractView from "./AbstractView.js";
import Config from "../config.js"

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Thông tin cá nhân");
    }

    async getHtml() {
        return `
        <div class="profile-container">
            <div class="profile-card">
                <div class="name">Nguyễn Văn Hùng</div>
                <table class="profile-info">
                    <tr>
                        <td class="name">Email</td>
                        <td class="name">Mã sinh viên</td>
                    </tr>
        
                    <tr>
                        <td id="email">ab@abc.mail</td>
                        <td id="stuid">21020221</td>
                    </tr>
        
                    <tr>
                        <td class="name">Chuyên ngành</td>
                    </tr>
        
                    <tr>
                        <td id="major">CN8 - Khoa học máy tính</td>
                    </tr>
                </table>
            </div>
        </div>
        `;
    }

    initialize() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }
        const profile = JSON.parse(localStorage.getItem('info'));
        const profileCard = document.querySelector('.profile-card');
        profileCard.querySelector('.name').innerHTML = profile['name'];
        profileCard.querySelector("#email").innerHTML = localStorage.getItem('email');
        profileCard.querySelector('#stuid').innerHTML = profile['id'];
        profileCard.querySelector("#major").innerHTML = `${profile['majorID']} - ${profile['majorName']}`
    }
}