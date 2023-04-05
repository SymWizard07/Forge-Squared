var removeRefs = { buttons: [], recipes: [] };

var activeFilter = "ingredient";

var recipeData = window.parent.recipeData;

function addRecipe() {
    let table = document.getElementById("recipe-table");
    let recipe = document.getElementById("recipe-template").cloneNode(true);
    let tableContainer = document.getElementById("recipe-table-container");
    let removeRecipe = document.getElementById("remove-recipe-template").cloneNode(true);

    recipe.hidden = false;
    recipe.className = "recipe";
    recipe.removeAttribute("id");

    let ingredientInput = recipe.querySelector(".ingredient .inital").cloneNode(true);
    let resultInput = recipe.querySelector(".result .inital").cloneNode(true);
    ingredientInput.hidden = false;
    ingredientInput.className = "input-container";
    ingredientInput.dataset.itemId = 0;
    resultInput.hidden = false;
    resultInput.className = "input-container";
    resultInput.dataset.itemId = 0;
    recipe.querySelector(".ingredient").appendChild(ingredientInput);
    recipe.querySelector(".result").appendChild(resultInput);

    removeRecipe.style.visibility = "visible";
    removeRecipe.removeAttribute("id");

    table.appendChild(recipe);
    removeRefs.recipes.push(recipe);
    tableContainer.appendChild(removeRecipe);
    removeRefs.buttons.push(removeRecipe);

    let availableId = -1;
    for (let i = 0; availableId == -1; i++) {
        if (recipeData.recipes.length == 0) {
            availableId = 0;
            break;
        }

        for (let ii = 0; ii < recipeData.recipes.length; ii++) {
            if (i == recipeData.recipes[ii].id) {
                availableId = -1;
                break;
            }
            else {
                availableId = i;
            }
        }
    }

    recipe.dataset.recipeId = availableId;

    recipeData.recipes.push({
        id: availableId,
        ingredients: [{
            item: null,
            amount: 1
        }],
        results: [{
            item: null,
            amount: 1
        }]
    });

    resizeRemoveButton();
}

function displayRecipe(recipeId) {
    let table = document.getElementById("recipe-table");
    let recipe = document.getElementById("recipe-template").cloneNode(true);
    let tableContainer = document.getElementById("recipe-table-container");
    let removeRecipe = document.getElementById("remove-recipe-template").cloneNode(true);

    recipe.hidden = false;
    recipe.className = "recipe";
    recipe.removeAttribute("id");

    let ingredientInputTemp = recipe.querySelector(".ingredient .inital");
    let resultInputTemp = recipe.querySelector(".result .inital");

    let currentRecipeData;
    recipeData.recipes.forEach(recipe => {
        if (recipe.id == recipeId) {
            currentRecipeData = recipe;
        }
    });

    let nextIngredient;
    for (let i = 0; i < currentRecipeData.ingredients.length; i++) {
        nextIngredient = ingredientInputTemp.cloneNode(true);
        nextIngredient.hidden = false;
        nextIngredient.className = "input-container";
        nextIngredient.querySelector(".input-text").value = currentRecipeData.ingredients[i].item;
        nextIngredient.querySelector(".input-num").value = currentRecipeData.ingredients[i].amount;
        nextIngredient.dataset.itemId = i;

        recipe.querySelector(".ingredient").appendChild(nextIngredient);
    }

    let nextResult;
    for (let i = 0; i < currentRecipeData.results.length; i++) {
        nextResult = resultInputTemp.cloneNode(true);
        nextResult.hidden = false;
        nextResult.className = "input-container";
        nextResult.querySelector(".input-text").value = currentRecipeData.results[i].item;
        nextResult.querySelector(".input-num").value = currentRecipeData.results[i].amount;
        nextResult.dataset.itemId = i;

        recipe.querySelector(".result").appendChild(nextResult);
    }

    removeRecipe.style.visibility = "visible";
    removeRecipe.removeAttribute("id");

    table.appendChild(recipe);
    removeRefs.recipes.push(recipe);
    tableContainer.appendChild(removeRecipe);
    removeRefs.buttons.push(removeRecipe);

    recipe.dataset.recipeId = recipeId;

    resizeRemoveButton();
}

function removeRecipe(removeButton, deleteData) {
    for (let i = 0; i < removeRefs.buttons.length; i++) {
        if (removeRefs.buttons[i] == removeButton) {
            let btn = removeRefs.buttons[i];
            let recipe = removeRefs.recipes[i];

            removeRefs.buttons.splice(i, 1);
            removeRefs.recipes.splice(i, 1);

            removeButton.remove();
            recipe.remove();

            if (deleteData) {
                for (let i = 0; i < recipeData.recipes.length; i++) {
                    if (recipeData.recipes[i].id == recipe.dataset.recipeId) {
                        recipeData.recipes.splice(i, 1);
                        break;
                    }
                }
            }

            resizeRemoveButton();

            return;
        }
    }
}

function addRecipeInput(element) {
    newItem = element.cloneNode(true);

    newItem.querySelector(".input-text").value = "";
    newItem.querySelector(".input-num").value = "1";

    newItem.className = "input-container";
    element.parentElement.appendChild(newItem);

    element.querySelector("button").innerText = "-";
    element.querySelector("button").onclick = removeRecipeInput;

    if (element.parentElement.className == "ingredient") {
        newItem.dataset.itemId = recipeData.recipes[element.parentElement.parentElement.dataset.recipeId].ingredients.length;
        recipeData.recipes[element.parentElement.parentElement.dataset.recipeId].ingredients.push({
            item: "",
            amount: 1
        });
    }
    else {
        newItem.dataset.itemId = recipeData.recipes[element.parentElement.parentElement.dataset.recipeId].results.length;
        recipeData.recipes[element.parentElement.parentElement.dataset.recipeId].results.push({
            item: "",
            amount: 1
        });
    }

    resizeRemoveButton();
}

function removeRecipeInput(e) {
    let btn = e.target;

    let currentRecipeId = btn.parentElement.parentElement.parentElement.dataset.recipeId;
    let currentItemId = btn.parentElement.dataset.itemId;

    if (btn.parentElement.parentElement.className == "ingredient") {
        recipeData.recipes[currentRecipeId].ingredients.splice(currentItemId, 1);
    }
    else {
        recipeData.recipes[currentRecipeId].results.splice(currentItemId, 1);
    }

    let recipeInputs = [];
    recipeInputs = Object.values(btn.parentElement.parentElement.getElementsByClassName("input-container"));
    recipeInputs.splice(currentItemId, 1);

    recipeInputs.forEach(e => {
        if (e.dataset.itemId > currentItemId) {
            e.dataset.itemId--;
        }
    });

    btn.parentElement.remove();

    resizeRemoveButton();
}

function updateText(element, isIngredient) {
    for (let i = 0; i < recipeData.recipes.length; i++) {
        if (recipeData.recipes[i].id == element.parentElement.parentElement.parentElement.dataset.recipeId) {
            if (isIngredient) {
                recipeData.recipes[i].ingredients[element.parentElement.dataset.itemId].item = element.value;
            }
            else {
                recipeData.recipes[i].results[element.parentElement.dataset.itemId].item = element.value;
            }

            break;
        }
    }
}

function updateNum(element, isIngredient) {
    for (let i = 0; i < recipeData.recipes.length; i++) {
        if (recipeData.recipes[i].id == element.parentElement.parentElement.parentElement.dataset.recipeId) {
            if (isIngredient) {
                recipeData.recipes[i].ingredients[element.parentElement.dataset.itemId].amount = element.value;
            }
            else {
                recipeData.recipes[i].results[element.parentElement.dataset.itemId].amount = element.value;
            }

            break;
        }
    }
}

function resizeRemoveButton() {
    let btn;

    for (let i = 0; i < removeRefs.buttons.length; i++) {
        btn = removeRefs.buttons[i];
        recipe = removeRefs.recipes[i];

        btn.style.left = (window.innerWidth - recipe.getBoundingClientRect().left) + "px";
        btn.style.top = (recipe.getBoundingClientRect().top + window.scrollY) + "px";
        btn.style.height = (recipe.getBoundingClientRect().height - 10) + "px";
        btn.style.width = "20px";
    }
}

window.addEventListener("resize", resizeRemoveButton);

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openDropdown() {
    document.getElementById("filter-dropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function setFilter(filter) {
    let filterDropdown = document.getElementById("filter-dropdown-button");

    if (filter == "ingredient") {
        filterDropdown.textContent = "Ingredient ▼";
    }
    if (filter == "result") {
        filterDropdown.textContent = "Result ▼";
    }

    activeFilter = filter;
}

document.getElementById("item-filter").addEventListener("keypress", e => {
    if (e.key == "Enter") {
        applyFilter();
    }
})

function applyFilter() {
    let filterText = document.querySelector("#item-filter").value;

    let removeBtn = document.querySelectorAll(".remove-recipe");
    removeBtn.forEach(element => {
        removeRecipe(element, false);
    });

    let filteredIndexes = [];
    recipeData.recipes.forEach(recipe => {
        if (activeFilter == "ingredient") {
            recipe.ingredients.forEach(ingredient => {
                if (ingredient.item == filterText) {
                    filteredIndexes.push(recipe.id);
                }
            });
        }
        if (activeFilter == "result") {
            recipe.results.forEach(result => {
                if (result.item == filterText) {
                    filteredIndexes.push(recipe.id);
                }
            });
        }
    });

    if (filterText == "") {
        recipeData.recipes.forEach(recipe => {
            filteredIndexes.push(recipe.id);
        });
    }

    filteredIndexes.forEach(index => {
        displayRecipe(index);
    });
}