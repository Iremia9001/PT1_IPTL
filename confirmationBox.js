function confirmPostStories() {
    showConfirmationBox();
}
window.confirmPostStories = confirmPostStories;

function showConfirmationBox() {
    const confirmationBox = document.createElement('div');
    confirmationBox.classList.add('confirmation-box');

    const confirmationMessage = document.createElement('p');
    confirmationMessage.textContent = 'Are you sure you want to post this story?';
    confirmationBox.appendChild(confirmationMessage);

    const confirmationButtons = document.createElement('div');
    confirmationButtons.classList.add('confirmation-buttons');

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Yes';
    confirmButton.addEventListener('click', () => {
        addStories();
        closeAddStoryContainer();
        document.body.removeChild(confirmationBox);
    });
    confirmationButtons.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'No';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(confirmationBox);
    });
    confirmationButtons.appendChild(cancelButton);

    confirmationBox.appendChild(confirmationButtons);
    document.body.appendChild(confirmationBox);
}