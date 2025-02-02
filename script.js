import { socialbutton } from './ShowStorybuttons.js';

const storiesContainer = document.getElementById('storiesContainer');
const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');
const storyViewerTitle = document.getElementById('storyViewerTitle');
const progressBar = document.getElementById('progressBar');

let storyQueue = [];
let storyTitles = [];
let currentStoryIndex = 0;
let progressTimeout;

function addStories() {
    const mediaInput = document.getElementById('mediaInput');
    const storyTitleInput = document.getElementById('storyTitle');
    const files = Array.from(mediaInput.files);
    const storyTitle = storyTitleInput.value.trim();
    const zoomSlider = document.getElementById('zoomSlider');
    const scale = zoomSlider.value;

    if (files.length === 0) {
        alert('Please select at least one image or video.');
        return;
    }

    files.forEach((file, index) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');

        const url = URL.createObjectURL(file);
        const title = storyTitle || `Untitled Story`; // Default title if none provided

        if (file.type.startsWith("image/")) {
            const img = document.createElement('img');
            img.src = url;
            img.style.transform = `scale(${scale})`;
            img.dataset.scale = scale;
            img.loading = 'lazy';
            storyElement.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = false;
            video.style.transform = `scale(${scale})`;
            video.dataset.scale = scale;
            video.loading = 'lazy';
            storyElement.appendChild(video);
        } else {
            alert('Unsupported file type.');
            return;
        }

        storyTitles.push(title); // Store the title in the array

        storyElement.addEventListener('click', () => {
            storyQueue = Array.from(storiesContainer.children)
                .filter(child => child !== storiesContainer.children[0])
                .map((child, idx) => ({
                    src: child.querySelector('img, video').src,
                    type: child.querySelector('img') ? 'image' : 'video',
                    title: storyTitles[idx], // Retrieve the title from the array
                    scale: child.querySelector('img, video').dataset.scale
                }));

            currentStoryIndex = storyQueue.findIndex(item => item.src === url);
            showStory(currentStoryIndex);
        });

        storiesContainer.appendChild(storyElement);
    });

    storyTitleInput.value = '';
    mediaInput.value = '';
}
window.addStories = addStories;

function showStory(index) {
    if (index < 0) {
        index = storyQueue.length - 1;
    } else if (index >= storyQueue.length) {
        index = 0;
    }

    currentStoryIndex = index;

    const story = storyQueue[index];
    storyViewerContent.innerHTML = '';
    storyViewerTitle.textContent = story.title || '';

    // Check if the close button already exists
    let closeButton = storyViewer.querySelector('.close-button');
    if (!closeButton) {
        // Create and add the close button if it doesn't exist
        closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', closeStoryViewer);
        storyViewer.appendChild(closeButton); // Append close button to the story viewer
    }

    let mediaElement;
    if (story.type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = story.src;
        mediaElement.style.transform = `scale(${story.scale})`;
        mediaElement.loading = 'lazy';
        storyViewerContent.appendChild(mediaElement);
        updateProgressBar(5000, () => showStory(currentStoryIndex + 1));
    } else if (story.type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = story.src;
        mediaElement.autoplay = true;
        mediaElement.style.transform = `scale(${story.scale})`;
        mediaElement.loading = 'lazy';
        storyViewerContent.appendChild(mediaElement);

        mediaElement.onloadedmetadata = () => {
            const duration = Math.min(mediaElement.duration * 1000, 15000);
            updateProgressBar(duration, () => showStory(currentStoryIndex + 1));
        };

        mediaElement.onended = () => {
            showStory(currentStoryIndex + 1);
        };
    }

    socialbutton();

    storyViewer.classList.add('active');

    document.addEventListener('keydown', handleKeyNavigation);
}

function closeStoryViewer() {
    const videos = storyViewerContent.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
    });
    storyViewer.classList.remove('active');
    clearTimeout(progressTimeout);
    document.removeEventListener('keydown', handleKeyNavigation);
}

function handleKeyNavigation(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return;
    }

    const video = storyViewerContent.querySelector('video');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    clearTimeout(progressTimeout);
    progressBar.style.width = '0%';
    storyViewerContent.innerHTML = '';
    showStory(currentStoryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    storyViewerTitle.textContent = storyQueue[currentStoryIndex].title || '';
}

function updateProgressBar(duration, callback) {
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';

    requestAnimationFrame(() => {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';

        progressTimeout = setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
        }, duration);
    });
}

function zoomMedia() {
    const zoomSlider = document.getElementById('zoomSlider');
    const mediaPreview = document.getElementById('mediaPreview');
    const scale = zoomSlider.value;

    Array.from(mediaPreview.children).forEach(mediaElement => {
        mediaElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
    });
}
window.zoomMedia = zoomMedia;

function previewMedia() {
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    const storyTitleInput = document.getElementById('storyTitle');
    const mediaControls = document.getElementById('mediaControls');
    const zoomSlider = document.getElementById('zoomSlider');
    const discardButton = document.getElementById('discardButton');
    const postStoriesButton = document.getElementById('postStoriesButton');
    mediaPreview.innerHTML = '';

    Array.from(mediaInput.files).forEach(file => {
        const url = URL.createObjectURL(file);
        let mediaElement;

        if (file.type.startsWith('image/')) {
            mediaElement = document.createElement('img');
            mediaElement.src = url;
            mediaElement.loading = 'lazy';
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.controls = true;
            mediaElement.loading = 'lazy';
        }

        mediaPreview.appendChild(mediaElement);
    });

    if (mediaInput.files.length > 0) {
        storyTitleInput.style.display = 'block';
        mediaControls.style.display = 'flex';
        zoomSlider.style.display = 'block';
        mediaPreview.style.display = 'flex';
        discardButton.style.display = 'block';
        postStoriesButton.style.display = 'block';
        closemediaInput();
    } else {
        storyTitleInput.style.display = 'none';
        mediaControls.style.display = 'none';
        zoomSlider.style.display = 'none';
        mediaPreview.style.display = 'none';
        discardButton.style.display = 'none';
        postStoriesButton.style.display = 'none';
        mediaInput.style.display = 'block';
    }
}
window.previewMedia = previewMedia;

function discardMedia() {
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    const storyTitleInput = document.getElementById('storyTitle');
    const mediaControls = document.getElementById('mediaControls');
    const zoomSlider = document.getElementById('zoomSlider');
    const discardButton = document.getElementById('discardButton');
    const postStoriesButton = document.getElementById('postStoriesButton');

    mediaInput.value = '';
    mediaPreview.innerHTML = '';
    storyTitleInput.value = '';
    storyTitleInput.style.display = 'none';
    mediaControls.style.display = 'none';
    zoomSlider.style.display = 'none';
    mediaPreview.style.display = 'none';
    discardButton.style.display = 'none';
    postStoriesButton.style.display = 'none';
    document.querySelector('.file-attachment').style.display = 'block';
}
window.discardMedia = discardMedia;

function closemediaInput() {
    document.querySelector('.file-attachment').style.display = 'none';
}

function cropMedia() {
    alert('Crop functionality is not implemented yet.');
}

function adjustDuration() {
    alert('Adjust duration functionality is not implemented yet.');
}

function confirmPostStories() {
    if (confirm('Are you sure you want to post these stories?')) {
        addStories();
        closeAddStoryContainer();
    }
}
window.confirmPostStories = confirmPostStories;

function openAddStoryContainer() {
    document.getElementById('addStoryContainer').style.display = 'block';
    document.getElementById('mediaInput').value = '';
    document.getElementById('storyTitle').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    document.getElementById('storyTitle').style.display = 'none';
    document.getElementById('mediaControls').style.display = 'none';
}
window.openAddStoryContainer = openAddStoryContainer;

function closeAddStoryContainer() {
    discardMedia();
    document.getElementById('addStoryContainer').style.display = 'none';
}
window.closeAddStoryContainer = closeAddStoryContainer;

document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('header').classList.toggle('dark-mode');
    document.querySelector('footer').classList.toggle('dark-mode');
    document.querySelector('.stories-container').classList.toggle('dark-mode');
    document.querySelector('.upload-container').classList.toggle('dark-mode');
    document.querySelector('.story-viewer').classList.toggle('dark-mode');
    document.querySelector('.story-viewer-content').classList.toggle('dark-mode');
    document.querySelector('.add-story-container').classList.toggle('dark-mode');
    document.querySelector('.upload-container input[type="text"]').classList.toggle('dark-mode');

    const darkModeButton = document.getElementById('darkModeToggle');
    if (document.body.classList.contains('dark-mode')) {
        darkModeButton.textContent = 'Light Mode';
    } else {
        darkModeButton.textContent = 'Dark Mode';
    }
});
