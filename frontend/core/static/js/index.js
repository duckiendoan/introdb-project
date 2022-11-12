import Dashboard from "./views/Dashboard.js";
// import Settings from "./views/Settings.js"

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard },
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

    const view  = new match.route.view();
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