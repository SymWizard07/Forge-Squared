var sidebarOpen = false;

var contentFrame = document.getElementById("content");

var recipeData = {
    recipes: [],
    items: []
}

var saveSettings = {
    title: "",
    description: "",
    zip: false,
    recipes: true,
    descriptions: true,
    images: false,
    settings: false
}

var storageTime = Date.now();

function toggleNav() {
    let sidebar = document.getElementById("nav-sidebar");
    let sidebarButton = document.getElementById("sidebar-button-container");

    if (!sidebarOpen) {
        sidebar.style.width = "250px";
        sidebarButton.style.left = "250px";
        document.body.style.marginLeft = "250px";
        sidebarOpen = true;
        return;
    }
    else {
        sidebar.style.width = "0px";
        sidebarButton.style.left = "0px";
        document.body.style.marginLeft = "0px";
        sidebarOpen = false;
    }
}

function loadPage(page) {
    toggleNav();
    contentFrame.src = page;
}

function updateSessionStorage() {
    if (storageTime + 10000 > Date.now()) {
        storageTime = Date.now();

        window.sessionStorage.setItem("recipeData", JSON.stringify(recipeData));
    }
}

window.onload = function () {
    if (window.sessionStorage.getItem("recipeData") != null) {
        recipeData = JSON.parse(window.sessionStorage.getItem("recipeData"));
    }
}