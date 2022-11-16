import AbstractView from "./AbstractView.js";
import Config from "../config.js"

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Thông tin cá nhân");
    }

    async getHtml() {
        return `

        `;
    }

    initialize() {
        
    }
}