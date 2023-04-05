var recipeData = window.parent.recipeData;

var saveSettings = window.parent.saveSettings;

var zip = new JSZip();

function generateSave() {
    if (saveSettings.title != "") {
        if (saveSettings.zip) {
            let saveData = {
                recipes: [],
                items: []
            };

            if (saveSettings.recipes) {
                saveData.recipes = recipeData.recipes;
            }
            if (saveSettings.descriptions) {
                for (let i = 0; i < recipeData.items.length; i++) {
                    saveData.items.push({
                        name: recipeData.items[i].name,
                        description: recipeData.items[i].description
                    });
                }
            }
            if (saveSettings.images) {
                recipeData.items.forEach(item => {
                    if (item.imageData != "") {
                        let imgBlob = base64ToPng(item.imageData);
                        zip.file(item.name + ".png", imgBlob, { binary: true });
                    }
                });
            }
            if (saveSettings.settings) {
                zip.file("meta.json", JSON.stringify(saveSettings));
            }

            zip.file("data.json", JSON.stringify(saveData));

            if (saveSettings.description != "") {
                zip.file("description.txt", saveSettings.title + "\n" + saveSettings.description);
            }

            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    saveAs(content, saveSettings.title + ".zip");
                });
        }
        else {
            let jsonData = {
                ...(saveSettings.recipes && { recipes: [] }),
                ...((saveSettings.descriptions || saveSettings.images) && { items: [] }),
                ...(saveSettings.settings && { meta: saveSettings })
            };
            if (saveSettings.recipes) {
                jsonData.recipes = recipeData.recipes;
            }
            if (saveSettings.images) {
                recipeData.items.forEach(item => {
                    jsonData.items.push({
                        name: item.name,
                        description: item.description,
                        ...(saveSettings.images && { imageData: item.imageData })
                    });
                });
            }
            let blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
            saveAs(blob, saveSettings.title + ".json");
        }
    }
    else {
        alert("A title is required.");
    }
}

function loadSave(element) {
    let files = element.files;
    let file = files[0];

    let loadStatus = document.getElementById("load-status");

    loadStatus.textContent = "Loading File...";
    if (element.value.endsWith(".json")) {
        file.text()
            .then(function (jsonContent) {
                parseData(jsonContent);
            });
    }
    if (element.value.endsWith(".zip")) {
        zip.loadAsync(file)
            .then(function (zip) {

                zip.file("data.json").async("string")
                    .then(function (contents) {
                        parseData(contents);
                    });
                let meta = zip.file("meta.json")
                if (meta != null) {
                    meta.async("string")
                    .then(function (contents) {
                        parseData(contents, true);
                    });
                }

                zip.forEach(function (relativePath, file) {
                    if (file.name.endsWith(".png")) {
                        file.async("base64")
                            .then(function (contents) {
                                attachItemImage(file.name.substring(0, file.name.length - 4), "data:image/png;base64," + contents);
                            });
                    }
                });
            });
    }
}

function parseData(jsonContent, metadataOnly) {
    let jsonData;
    let loadStatus = document.getElementById("load-status");

    try {
        if (metadataOnly) {
            jsonData = JSON.parse(jsonContent);
            window.parent.saveSettings = jsonData;
            saveSettings = window.parent.saveSettings
            loadSaveSettings();
            console.log("Test");
            loadStatus.textContent += ", Metadata Loaded";
            return;
        }
        loadStatus.textContent = "Parsing JSON...";
        jsonData = JSON.parse(jsonContent);
    }
    catch (err) {
        loadStatus.textContent = "Could not parse. File may be corrupt.";
        console.log(err);
        return;
    }

    if (jsonData.recipes != undefined) {
        recipeData.recipes = jsonData.recipes;
        loadStatus.textContent = "Recipes Loaded";
    }
    if (jsonData.items != undefined) {
        recipeData.items = jsonData.items;
        loadStatus.textContent += ", Item Data Loaded";
    }
    if (jsonData.meta != undefined) {
        window.parent.saveSettings = jsonData.meta;
        saveSettings = window.parent.saveSettings
        loadSaveSettings();
        loadStatus.textContent += ", Metadata Loaded";
    }
}

function attachItemImage(itemName, imageData) {
    recipeData.items.forEach(item => {
        if (item.name == itemName) {
            item.imageData = imageData;
        }
    });
}

function base64ToPng(base64Data) {
    const byteString = window.atob(base64Data.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'image/png' });
    return blob;
}

window.onload = loadSaveSettings;

function loadSaveSettings() {
    document.getElementById("title-input").value = saveSettings.title;
    document.getElementById("description-input").value = saveSettings.description;
    document.getElementById("zip-option").checked = saveSettings.zip;
    document.getElementById("recipe-save-option").checked = saveSettings.recipes;
    document.getElementById("descriptions-save-option").checked = saveSettings.descriptions;
    document.getElementById("images-save-option").checked = saveSettings.images;
    document.getElementById("settings-save-option").checked = saveSettings.settings;
}