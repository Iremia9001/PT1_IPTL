// darkMode.js
document.addEventListener("DOMContentLoaded", function () {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const body = document.body;
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const newsfeed = document.querySelector(".newsfeed");
    const storiesContainer = document.querySelector(".stories-container");
    const uploadContainer = document.querySelector(".upload-container");
    const storyViewer = document.querySelector(".story-viewer");
    const storyViewerContent = document.querySelector(".story-viewer-content");
    const addStoryContainer = document.querySelector(".add-story-container");
    const uploadInput = document.querySelector('.upload-container input[type="text"]');

    // Load dark mode preference from localStorage
    if (localStorage.getItem("darkMode") === "enabled") {
        enableDarkMode();
    }

    // Toggle Dark Mode
    darkModeToggle.addEventListener("click", function () {
        if (body.classList.contains("dark-mode")) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    function enableDarkMode() {
        body.classList.add("dark-mode");
        header.classList.add("dark-mode");
        footer.classList.add("dark-mode");
        newsfeed.classList.add("dark-mode");
        storiesContainer.classList.add("dark-mode");
        uploadContainer.classList.add("dark-mode");
        storyViewer.classList.add("dark-mode");
        storyViewerContent.classList.add("dark-mode");
        addStoryContainer.classList.add("dark-mode");
        if (uploadInput) uploadInput.classList.add("dark-mode");

        // Change button icon (Switch to Sun)
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';

        // Save preference
        localStorage.setItem("darkMode", "enabled");
    }

    function disableDarkMode() {
        body.classList.remove("dark-mode");
        header.classList.remove("dark-mode");
        footer.classList.remove("dark-mode");
        newsfeed.classList.remove("dark-mode");
        storiesContainer.classList.remove("dark-mode");
        uploadContainer.classList.remove("dark-mode");
        storyViewer.classList.remove("dark-mode");
        storyViewerContent.classList.remove("dark-mode");
        addStoryContainer.classList.remove("dark-mode");
        if (uploadInput) uploadInput.classList.remove("dark-mode");

        // Change button icon (Switch to Moon)
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';

        // Save preference
        localStorage.setItem("darkMode", "disabled");
    }
});
