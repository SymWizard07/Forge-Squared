var recipeData = window.parent.recipeData;

var activeDescription;

document.querySelector(".name-input").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        addItem();
    }
});

function addItem() {
    let newItemName = document.querySelector(".name-input").value;
    document.querySelector(".name-input").value = "";

    let itemExists = false;
    recipeData.items.forEach(item => {
        if (item.name == newItemName) {
            itemExists = true;
        }
    }); 

    if (!itemExists) {
        recipeData.items.push({
            name: newItemName,
            description: ""
        });
        if (document.querySelector(".empty-link") != null) {
            applyFilter();
        }
        else {
            displayItem(newItemName, true);
        }
    }
    else {
        alert("Item already exists.");
    }
}

function displayItem(item, top) {
    let indexList = document.querySelector(".index-container .index-list");

    let newItem = document.querySelector(".index-container .index-list .index-item-template").cloneNode(true);
    newItem.className = "index-item";
    newItem.hidden = false;
    newItem.querySelector("a").textContent = item;

    if (item == "") {
        newItem.querySelector("a").textContent = "No items to display.";
        newItem.querySelector("a").className = "empty-link";
        newItem.querySelector("a").onclick = null;
    }

    if (!top) {
        indexList.appendChild(newItem);
    }
    else {
        indexList.insertBefore(newItem, indexList.children[3]);
    }
}

function displayDescription(link) {
    activeDescription = link.textContent;

    document.getElementById("inital-description-message").hidden = true;
    let descriptionArea = document.getElementById("description-area");
    descriptionArea.hidden = false;
    document.getElementById("file-input").hidden = false;
    let imageArea = document.getElementById("item-image");
    document.getElementById("remove-item").hidden = false;

    document.querySelectorAll(".item-selector").forEach(element => {
        element.hidden = true;
    });

    link.parentElement.querySelector(".item-selector").hidden = false;

    descriptionArea.value = "";
    imageArea.src = "";

    recipeData.items.forEach(item => {
        if (item.name == activeDescription) {
            descriptionArea.value = item.description;
            if (item.imageData != undefined)
                imageArea.src = item.imageData;
        }
    });
}

function updateDescription(descriptionArea) {
    let hasDescription = false;

    for (let i = 0; i < recipeData.items.length; i++) {
        let item = recipeData.items[i];
        if (activeDescription == item.name) {
            hasDescription = true;

            item.description = descriptionArea.value;

            break;
        }
    }

    if (!hasDescription) {
        recipeData.items.push({
            name: activeDescription,
            description: descriptionArea.textContent,
            imageData: ""
        });
    }
}

function updateImage(imageArea) {
    let hasDescription = false;

    for (let i = 0; i < recipeData.items.length; i++) {
        let item = recipeData.items[i];
        if (activeDescription == item.name) {
            hasDescription = true;

            item.imageData = imageArea.src;

            break;
        }
    }

    if (!hasDescription) {
        recipeData.items.push({
            name: activeDescription,
            description: "",
            imageData: imageArea.src
        });
    }
}

function removeItem() {
    for (let i = 0; i < recipeData.items.length; i++) {
        if (activeDescription == recipeData.items[i].name) {
            recipeData.items.splice(i, 1);

            applyFilter();

            document.getElementById("inital-description-message").hidden = false;
            let descriptionArea = document.getElementById("description-area");
            descriptionArea.hidden = true;
            document.getElementById("file-input").hidden = true;
            let imageArea = document.getElementById("item-image");
            imageArea.src = "";
            document.getElementById("remove-item").hidden = true;
        }
    }
}

document.querySelector(".item-filter").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        applyFilter();
    }
});

function applyFilter() {
    document.querySelectorAll(".index-container .index-list .index-item").forEach(e => {
        e.remove();
    })

    let filterText = document.querySelector(".item-filter").value;
    filterText = filterText.toLowerCase();

    let filteredStrings = [];

    function isRepeat(e) {
        for (let i = 0; i < filteredStrings.length; i++) {
            if (filteredStrings[i] == e) {
                return true;
            }
        }

        return false;
    }

    recipeData.recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            if (ingredient.item != null && ingredient.item.name.toLowerCase().startsWith(filterText)) {
                if (!isRepeat(ingredient.item.name)) {
                    filteredStrings.push(ingredient.item.name);
                }
            }
        });

        recipe.results.forEach(result => {
            if (result.item != null && result.item.name.toLowerCase().startsWith(filterText)) {
                if (!isRepeat(result.item.name)) {
                    filteredStrings.push(result.item.name);
                }
            }
        });
    });
    recipeData.items.forEach(item => {
        if (item.name.toLowerCase().startsWith(filterText)) {
            if (!isRepeat(item.name)) {
                filteredStrings.push(item.name);
            }
        }
    });

    filteredStrings.sort();

    filteredStrings.forEach(item => {
        displayItem(item);
    });

    if (filteredStrings.length == 0) {
        displayItem("");
    }
}

applyFilter();

function encodeImageFileAsURL(element) {
    var file = element.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        let imageArea = document.getElementById("item-image");
        imageArea.src = reader.result;
        updateImage(imageArea);
    }
    reader.readAsDataURL(file);
}