var recipeData = window.parent.recipeData;

var activeProperty;

var propertyList = document.querySelector("#property-index-list");
var itemList = document.querySelector("#item-index-list");

var itemRemovalActive = false;

propertyList.querySelector(".name-input").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        addProperty();
    }
});

// Adds a property to the filtered list and re-filters it.
function addProperty() {
    let newPropName = propertyList.querySelector(".name-input").value;
    propertyList.querySelector(".name-input").value = "";

    newPropName = capitalize(newPropName);

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

// Displays the filtered property list, one at a time. Called from applyPropertyFilter.
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
        newItem.querySelector(".property-color").hidden = true;
    }

    recipeData.properties.forEach(propertyData => {
        if (propertyData.name == property) {
            newItem.querySelector(".property-color").style.setProperty("--property-color", propertyData.color);
        }
    });

    if (!top) {
        indexList.appendChild(newItem);
    }
    else {
        indexList.insertBefore(newItem, indexList.children[3]);
    }
}

// Displays the filtered item list, one at a time. Called from applyItemFilter.
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

    recipeData.items.forEach(itemData => {
        if (itemData.name == item) {
            recipeData.properties.forEach(propertyData => {
                if (propertyData.color != undefined && itemData.properties != undefined && itemData.properties.includes(propertyData.name)) {
                    let newPropColor = newItem.querySelector(".property-color-template").cloneNode();
                    newPropColor.className = "property-color";
                    newPropColor.hidden = false;
                    newPropColor.style.setProperty("--property-color", propertyData.color);

                    newItem.appendChild(newPropColor);
                }
            })
        }
    })

    if (!top) {
        indexList.appendChild(newItem);
    }
    else {
        indexList.insertBefore(newItem, indexList.children[3]);
    }
}

// Displays the property description, item applier, and property color picker.
function displayDescription(link) {
    activeProperty = link.textContent;

    if (itemRemovalActive) {
        toggleItemRemoval(document.querySelector("#item-removal"));
    }
    setInstruction();
    let descriptionArea = document.getElementById("description-area");
    descriptionArea.hidden = false;
    document.getElementById("property-options").hidden = false;
    document.getElementById("property-options-2").hidden = false;
    document.getElementById("remove-property").hidden = false;
    document.getElementById("close-description").hidden = false;

    let color = "";
    recipeData.properties.forEach(property => {
        if (property.name == activeProperty) {
            if (property.color != undefined) {
                color = property.color;
            }
        }
    });
    document.querySelector('#color-field').value = color;
    document.querySelector('#color-field').dispatchEvent(new Event('input', { bubbles: true }));

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

// Closes the property description, item applier, and property color picker and allows the user to either select another property to edit or open the item property editor.
function closeDescription() {
    document.getElementById("description-area").hidden = true;
    document.getElementById("property-options").hidden = true;
    document.getElementById("property-options-2").hidden = true;
    document.getElementById("remove-property").hidden = true;
    document.getElementById("close-description").hidden = true;

    activeProperty = undefined;
    setInstruction();
    applyPropertyFilter();
    applyItemFilter();
}

// Updates description in internal storage when changed.
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

// Displays the item property editor.
function displayItemPropEditor() {

}

// Removes the property entirely.
function removeProperty() {
    for (let i = 0; i < recipeData.properties.length; i++) {
        if (activeProperty == recipeData.properties[i].name) {
            recipeData.properties.splice(i, 1);

            applyPropertyFilter();

            let descriptionArea = document.getElementById("description-area");
            descriptionArea.hidden = true;
            document.getElementById("property-options").hidden = true;
            document.getElementById("property-options-2").hidden = true;
            document.getElementById("remove-property").hidden = true;
            document.getElementById("close-description").hidden = true;
        }
    }

    removeActivePropertyAll();

    activeProperty = undefined;
    setInstruction();
}

// Processes an item click based on current active triggers.
function handleItemLink(itemLink) {
    if (activeProperty == undefined) {
        displayItemPropEditor(itemLink);
        return;
    }
    if (itemRemovalActive) {
        removeActiveProperty(itemLink);
        return;
    }
    else {
        applyActiveProperty(itemLink);
        return;
    }
}

// Adds a property to a clicked item.
function applyActiveProperty(itemLink) {
    if (activeProperty == undefined)
        return;

    let itemName = itemLink.textContent;

    let itemExists = false;
    recipeData.items.forEach(item => {
        if (item.name == itemName) {
            itemExists = true;
            if (item.properties == undefined) {
                item.properties = [];
            }
            for (let i = 0; i < item.properties.length; i++) {
                if (item.properties[i] == activeProperty) {
                    return;
                }
            }
            item.properties.push(activeProperty);
        }
    });

    if (!itemExists) {
        recipeData.items.push({
            name: itemName,
            description: "",
            properties: [activeProperty]
        });
    }

    applyItemFilter();
}

// Removes a property from a clicked item.
function removeActiveProperty(itemLink) {
    if (activeProperty == undefined)
        return;

    let itemName = itemLink.textContent;

    recipeData.items.forEach(item => {
        if (item.name == itemName) {
            if (item.properties != undefined) {
                for (let i = 0; i < item.properties.length; i++) {
                    if (item.properties[i] == activeProperty) {
                        item.properties.splice(i, 1);
                    }
                }
            }
        }
    });

    applyItemFilter();
}

// Adds the active property to all items in list.
function applyActivePropertyAll() {
    let itemList = document.querySelector("#item-index-list .index-list");
    let itemLinks = itemList.querySelectorAll(".index-item .item-link");

    itemLinks.forEach(itemLink => {
        applyActiveProperty(itemLink);
    });
}

// Removes the active property from all items in list.
function removeActivePropertyAll() {
    let itemList = document.querySelector("#item-index-list .index-list");
    let itemLinks = itemList.querySelectorAll(".index-item .item-link");

    itemLinks.forEach(itemLink => {
        removeActiveProperty(itemLink);
    });
}

// Toggles items to be stripped of the active property when clicked.
function toggleItemRemoval(btn) {
    itemRemovalActive = !itemRemovalActive;
    btn.dataset.activeToggle = itemRemovalActive;

    setInstruction();
}

// Sets the current instruction text for the user based on active triggers.
function setInstruction() {
    document.querySelector("#property-instructions p").textContent = "Click a Property to access its description page, or an Item to change its property values.";

    if (activeProperty != undefined) {
        document.querySelector("#property-instructions p").textContent = "Click an item to allow it to have this property.";
        if (itemRemovalActive) {
            document.querySelector("#property-instructions p").textContent = "Click an item remove this property from it.";
        }
    }
}

Coloris({
    alpha: false,
    swatches: [],
    clearButton: true
});

// Updates color of property in internal storage. List colors are updated by the filter.
function setColor() {
    let propColor = document.querySelector("#property-description-container .clr-field").style.color;

    recipeData.properties.forEach(property => {
        if (property.name == activeProperty) {
            property.color = rgbToHex(propColor);
        }
    });

    applyPropertyFilter();
    applyItemFilter();
}

propertyList.querySelector(".item-filter").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        applyPropertyFilter();
    }
});

// Looks through all properties beginning with filter string and sorts them alphanumerically into the filtered property list. Calls display function for each property.
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

// Looks through items contained in recipeData recipes and items, and uses filter string to sort alphanumerically into the filtered item list. Calls display function per item.
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
            if (result.item != null && result.item.name.toLowerCase().startsWith(filterText)) {
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

// function provided courtesy of ChatGPT
function capitalize(str) {
    if (str.length === 0) {
        return ""; // return an empty string if input is empty
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ChatGPT
function rgbToHex(rgbString) {
    // Get the individual RGB values
    const [r, g, b] = rgbString
        .substring(rgbString.indexOf("(") + 1, rgbString.lastIndexOf(")"))
        .split(",")
        .map((val) => parseInt(val.trim()));

    // Convert to hex
    const hexValue = ((r << 16) | (g << 8) | b).toString(16);

    // Add leading zeros if necessary
    const hexString = "#" + "0".repeat(6 - hexValue.length) + hexValue;

    return hexString;
}

applyPropertyFilter();
applyItemFilter();
