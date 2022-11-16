import AbstractView from "./AbstractView.js";
import Config from "../config.js"

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Đăng xuất");
    }

    async getHtml() {
        return `
        `;
    }

    initialize() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login';
            return;
        }

        window.localStorage.clear();
        window.location.href = "/login";
    }
}