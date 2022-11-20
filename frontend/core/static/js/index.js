import Dashboard from "./views/Dashboard.js";
import Login from "./views/Login.js";
import Logout from "./views/Logout.js";
import Profile from "./views/Profile.js";

const router = async () => {
    const routes = [
        { path: "/", view: Login },
        { path: "/login", view: Login},
        { path: "/dashboard", view: Dashboard},
        { path: "/profile", view: Profile},
        { path: "/logout", view: Logout}
        // { path: "/settings", view: Settings },
        // { path: "/profile", view: () => console.log("Viewing profile") }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(x => x.isMatch);
    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();
    
    if (view.isLoggedIn()) {
        document.querySelector("header > nav").innerHTML = `
        <ul class="nav nav-main">
                    <li class="item-top">
                        <a href="/profile" class="link link-top nav__link" data-link><i class="button__icon fa-solid fa-user"></i>Thông tin cá nhân</a>
                    </li>
                    <li class="item-top">
                        <a href="/logout" class="link link-top" data-link><i class="button__icon fa fa-sign-out"></i>Đăng xuất</a>
                    </li>
                </ul>
        `;
    } else {
        if (location.pathname != '/login')
            window.location.href = '/login';
    }

    document.querySelector("#app").innerHTML = await view.getHtml();
    view.initialize();
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Loaded!");
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });
    router();
});