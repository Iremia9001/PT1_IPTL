// darkMode.js
document.getElementById('darkModeToggle').addEventListener('click', () => {
    // Toggle dark mode class on body and relevant elements
    document.body.classList.toggle('dark-mode');
    document.querySelector('header').classList.toggle('dark-mode');
    document.querySelector('footer').classList.toggle('dark-mode');
    document.querySelector('.stories-container').classList.toggle('dark-mode');
    document.querySelector('.upload-container').classList.toggle('dark-mode');
    document.querySelector('.story-viewer').classList.toggle('dark-mode');
    document.querySelector('.story-viewer-content').classList.toggle('dark-mode');
    document.querySelector('.add-story-container').classList.toggle('dark-mode');
    document.querySelector('.upload-container input[type="text"]').classList.toggle('dark-mode');

    // Change the text of the dark mode toggle button
    const darkModeButton = document.getElementById('darkModeToggle');
    if (document.body.classList.contains('dark-mode')) {
        darkModeButton.textContent = 'Light Mode';
    } else {
        darkModeButton.textContent = 'Dark Mode';
    }
});
