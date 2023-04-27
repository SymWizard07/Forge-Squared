var recipeData = window.parent.recipeData;

var activeProperty;

var propertyList = document.querySelector("#property-index-list");
var itemList = document.querySelector("#item-index-list");

propertyList.querySelector(".name-input").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        addProperty();
    }
});

function addProperty() {
    let newPropName = propertyList.querySelector(".name-input").value;
    propertyList.querySelector(".name-input").value = "";

    let propExists = false;
    recipeData.properties.forEach(property => {
        if (property.name == newPropName) {
            propExists = true;
        }
    }); 

    if (!propExists) {
        recipeData.properties.push({
            name: newPropName,
            description: ""
        });
        if (propertyList.querySelector(".empty-link") != null) {
            applyPropertyFilter();
        }
        else {
            displayProperty(newPropName, true);
        }
    }
    else {
        alert("Property already exists.");
    }
}

function displayProperty(property, top) {
    let indexList = propertyList.querySelector(".index-list");

    let newItem = propertyList.querySelector(".index-list .index-item-template").cloneNode(true);
    newItem.className = "index-item";
    newItem.hidden = false;
    newItem.querySelector("a").textContent = property;

    if (property == "") {
        newItem.querySelector("a").textContent = "No properties to display.";
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

function displayItem(item, top, hasActiveProp) {
    let indexList = itemList.querySelector(".index-list");

    let newItem = itemList.querySelector(".index-list .index-item-template").cloneNode(true);
    newItem.className = "index-item";
    newItem.hidden = false;
    newItem.querySelector("a").textContent = item;
    newItem.dataset.hasActiveProp = hasActiveProp;

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
    activeProperty = link.textContent;

    document.querySelector("#property-instructions p").textContent = "Click an item to allow it to have this property.";
    let descriptionArea = document.getElementById("description-area");
    descriptionArea.hidden = false;
    document.getElementById("property-options").hidden = false;
    document.getElementById("remove-property").hidden = false;

    propertyList.querySelectorAll(".item-selector").forEach(element => {
        element.hidden = true;
    });

    link.parentElement.querySelector(".item-selector").hidden = false;

    descriptionArea.value = "";

    recipeData.properties.forEach(property => {
        if (property.name == activeProperty) {
            descriptionArea.value = property.description;
        }
    });

    applyItemFilter();
}

function updateDescription(descriptionArea) {
    let hasDescription = false;

    for (let i = 0; i < recipeData.properties.length; i++) {
        let property = recipeData.properties[i];
        if (activeProperty == property.name) {
            hasDescription = true;

            property.description = descriptionArea.value;

            break;
        }
    }

    if (!hasDescription) {
        recipeData.properties.push({
            name: activeProperty,
            description: descriptionArea.textContent
        });
    }
}

function removeProperty() {
    for (let i = 0; i < recipeData.properties.length; i++) {
        if (activeProperty == recipeData.properties[i].name) {
            recipeData.properties.splice(i, 1);

            applyPropertyFilter();

            let descriptionArea = document.getElementById("description-area");
            descriptionArea.hidden = true;
            document.getElementById("property-options").hidden = true;
        }
    }
}

function applyActiveProperty(itemLink) {
    if (activeProperty == undefined)
        return;

    let itemName = itemLink.textContent;

    let itemExists = false;
    recipeData.items.forEach(item => {
        if (item.name == itemName) {
            if (item.properties == undefined) {
                item.properties = [];
            }
            item.properties.forEach(property => {
                if (property == activeProperty) {
                    return;
                }
            });
            item.properties.push(activeProperty);
        }
    });

    applyItemFilter();
}

Coloris({
    alpha: false,
    swatches: [],
    clearButton: true
})

propertyList.querySelector(".item-filter").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        applyPropertyFilter();
    }
});

function applyPropertyFilter() {
    propertyList.querySelectorAll(".index-list .index-item").forEach(e => {
        e.remove();
    })

    let filterText = propertyList.querySelector(".item-filter").value;
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

    recipeData.properties.forEach(property => {
        if (property.name.toLowerCase().startsWith(filterText)) {
            if (!isRepeat(property.name)) {
                filteredStrings.push(property.name);
            }
        }
    });

    filteredStrings.sort();

    filteredStrings.forEach(property => {
        displayProperty(property);
    });

    if (filteredStrings.length == 0) {
        displayProperty("");
    }
}

function applyItemFilter() {
    itemList.querySelectorAll(".index-list .index-item").forEach(e => {
        e.remove();
    })

    let filterText = itemList.querySelector(".item-filter").value;
    filterText = filterText.toLowerCase();

    let filteredStringMap = [];

    function isRepeat(e) {
        for (let i = 0; i < filteredStringMap.length; i++) {
            if (filteredStringMap[i][0] == e) {
                return true;
            }
        }

        return false;
    }

    recipeData.recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            if (ingredient.item != null && ingredient.item.name.toLowerCase().startsWith(filterText)) {
                if (!isRepeat(ingredient.item.name)) {
                    filteredStringMap.push([ingredient.item.name, false]);
                }
            }
        });

        recipe.results.forEach(result => {
            if (result.item != null && result.item.toLowerCase().startsWith(filterText)) {
                if (!isRepeat(result.item)) {
                    filteredStringMap.push([result.item.name, false]);
                }
            }
        });
    });
    recipeData.items.forEach(item => {
        if (item.name.toLowerCase().startsWith(filterText)) {
            if (!isRepeat(item.name)) {
                    filteredStringMap.push([item.name, false]);
            }
        }
    });

    filteredStringMap.sort((a, b) => {
        if (a[0] > b[0]) return 1;
        if (a[0] < b[0]) return -1;
        return 0;
    });

    filteredStringMap.forEach(e => {
        recipeData.items.forEach(item => {
            if (item.name == e[0] && item.properties != undefined) {
                console.log(item.properties);
                e[1] = item.properties.includes(activeProperty);
            }
        });
    });

    filteredStringMap.forEach(e => {
        displayItem(e[0], false, e[1]);
    });

    if (filteredStringMap.length == 0) {
        displayItem("", false, false);
    }
}

applyPropertyFilter();
applyItemFilter();
