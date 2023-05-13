const resetButton = document.querySelector('.reset-btn');
const resetConfirmButton = document.querySelector('.reset-confirm');
const resetText = document.querySelector(".reset-confirmed-text");

resetButton.addEventListener('click', () => {
    resetConfirmButton.classList.toggle('visible');
});

resetButton.addEventListener('focusout', () => {
    resetConfirmButton.classList.remove('visible');
});

resetConfirmButton.addEventListener('click', () => {
    resetText.textContent = "System Reset.";

    window.parent.recipeData = {
        recipes: [],
        items: [],
        properties: []
    }
})