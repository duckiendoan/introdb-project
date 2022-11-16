export default class {
    constructor() {

    }

    setTitle(title) {
        document.title = title;
    }

    async getHtml() {
        return "";
    }

    initialize() {
        
    }

    isLoggedIn() {
        const token = window.localStorage.getItem("token");
        if (!token) return false;
        return true;
    }
}