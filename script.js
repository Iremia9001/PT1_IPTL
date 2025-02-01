const storiesContainer = document.getElementById('storiesContainer');
const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');
const storyViewerTitle = document.getElementById('storyViewerTitle');
const progressBar = document.getElementById('progressBar');

let storyQueue = [];
let currentStoryIndex = 0;
let progressTimeout;
let navigationTimeout;

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

    files.forEach((file) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');

        const url = URL.createObjectURL(file);
        const title = storyTitle || "Untitled Story";

        if (file.type.startsWith("image/")) {
            const img = document.createElement('img');
            img.src = url;
            img.style.transform = `scale(${scale})`; // Apply the scale
            img.dataset.scale = scale; // Store the scale in a data attribute
            storyElement.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = false;
            video.style.transform = `scale(${scale})`; // Apply the scale
            video.dataset.scale = scale; // Store the scale in a data attribute
            storyElement.appendChild(video);
        } else {
            alert('Unsupported file type.');
            return;
        }

        storyElement.addEventListener('click', () => {
            storyQueue = Array.from(storiesContainer.children)
                .filter(child => child !== storiesContainer.children[0])
                .map(child => ({
                    src: child.querySelector('img, video').src,
                    type: child.querySelector('img') ? 'image' : 'video',
                    title: title,
                    scale: child.querySelector('img, video').dataset.scale // Retrieve the scale from the data attribute
                }));

            currentStoryIndex = storyQueue.findIndex(item => item.src === url);
            showStory(currentStoryIndex);
        });

        storiesContainer.appendChild(storyElement);
    });

    storyTitleInput.value = '';
    mediaInput.value = '';
}

function showStory(index) {
    if (index < 0) {
        index = storyQueue.length - 1; // Loop to the last story
    } else if (index >= storyQueue.length) {
        index = 0; // Loop to the first story
    }

    currentStoryIndex = index; // Update currentStoryIndex

    const story = storyQueue[index];
    storyViewerContent.innerHTML = '';
    storyViewerTitle.textContent = story.title || ''; // Set the story title dynamically

    // Create and add the close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeStoryViewer);

    storyViewer.appendChild(closeButton); // Append close button to the story viewer

    let mediaElement;
    if (story.type === 'image') {
        mediaElement = document.createElement('img');
        mediaElement.src = story.src;
        mediaElement.style.transform = `scale(${story.scale})`; // Apply the scale
        storyViewerContent.appendChild(mediaElement);
        updateProgressBar(5000, () => showStory(currentStoryIndex + 1)); // 5 seconds for images
    } else if (story.type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = story.src;
        mediaElement.autoplay = true;
        mediaElement.style.transform = `scale(${story.scale})`; // Apply the scale
        storyViewerContent.appendChild(mediaElement);

        mediaElement.onloadedmetadata = () => {
            const duration = Math.min(mediaElement.duration * 1000, 15000); // 15 seconds or original duration
            updateProgressBar(duration, () => showStory(currentStoryIndex + 1));
        };

        mediaElement.onended = () => {
            showStory(currentStoryIndex + 1);
        };
    }

    storyViewer.classList.add('active');

    // Add event listener to skip to the next story on right click and go back to previous story on left click
    const handleClick = (event) => {
        if (navigationTimeout) {
            clearTimeout(navigationTimeout);
        }

        navigationTimeout = setTimeout(() => {
            const rect = storyViewerContent.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const width = rect.width;

            if (clickX > width / 2) {
                showStory(currentStoryIndex + 1);
            } else {
                showStory(currentStoryIndex - 1);
            }
        }, 200); // Debounce time of 200ms
    };

    storyViewerContent.addEventListener('click', handleClick);

    // Add event listener for arrow keys
    document.addEventListener('keydown', handleKeyNavigation);

    // Store the event listener for removal later
    storyViewerContent.handleClick = handleClick;
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

    // Remove the close button from the story viewer
    const closeButton = storyViewer.querySelector('.close-button');
    if (closeButton) {
        closeButton.remove();
    }

    // Remove the click event listener from the story viewer content
    if (storyViewerContent.handleClick) {
        storyViewerContent.removeEventListener('click', storyViewerContent.handleClick);
        delete storyViewerContent.handleClick;
    }
}

function handleKeyNavigation(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
        return; // Ignore keys other than ArrowRight and ArrowLeft
    }

    if (navigationTimeout) {
        clearTimeout(navigationTimeout);
    }

    navigationTimeout = setTimeout(() => {
        const video = storyViewerContent.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        clearTimeout(progressTimeout);
        progressBar.style.width = '0%';
        storyViewerContent.innerHTML = ''; // Clear content to avoid multiple instances
        showStory(currentStoryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }, 200); // Increased debounce time to 200ms
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
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.controls = true;
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
