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
    const mediaPreview = document.getElementById('mediaPreview');
    const croppedVideo = mediaPreview.querySelector('video');

    if (files.length === 0 && !croppedVideo) {
        alert('Please select at least one image or video.');
        return;
    }

    if (croppedVideo) {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');

        const url = croppedVideo.src; // Use the cropped video URL
        const title = storyTitle || `Untitled Story`; // Default title if none provided

        croppedVideo.style.transform = `scale(${scale})`;
        croppedVideo.dataset.scale = scale;
        croppedVideo.loading = 'lazy';
        storyElement.appendChild(croppedVideo.cloneNode(true));

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
    } else {
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
    }

    storyTitleInput.value = '';
    mediaInput.value = '';
    mediaPreview.innerHTML = '';
}
//tode : add adio to the story
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

    let hasVideo = false;

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
            hasVideo = true;
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

        const cropButton = mediaControls.querySelector('button');
        const adjustDurationButton = mediaControls.querySelector('button[onclick="adjustDuration()"]');

        if (hasVideo) {
            if (cropButton) cropButton.style.display = 'inline-block';
            if (adjustDurationButton) adjustDurationButton.style.display = 'inline-block';
        } else {
            if (cropButton) cropButton.style.display = 'none';
            if (adjustDurationButton) adjustDurationButton.style.display = 'none';
        }

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
    const mediaPreview = document.getElementById('mediaPreview');
    const video = mediaPreview.querySelector('video');
    if (!video) {
        alert('No video to crop.');
        return;
    }

    // Clear previous crop inputs and buttons
    const mediaControls = document.getElementById('mediaControls');
    mediaControls.innerHTML = '';

    const cropStartInput = document.createElement('input');
    cropStartInput.type = 'number';
    cropStartInput.placeholder = 'Start (seconds)';
    cropStartInput.min = 0;
    cropStartInput.max = video.duration;
    cropStartInput.step = 0.1;

    const cropEndInput = document.createElement('input');
    cropEndInput.type = 'number';
    cropEndInput.placeholder = 'End (seconds)';
    cropEndInput.min = 0;
    cropEndInput.max = video.duration;
    cropEndInput.step = 0.1;

    const cropButton = document.createElement('button');
    cropButton.textContent = 'Crop';
    cropButton.addEventListener('click', () => {
        const start = parseFloat(cropStartInput.value);
        const end = parseFloat(cropEndInput.value);

        if (isNaN(start) || isNaN(end) || start >= end || start < 0 || end > video.duration) {
            alert('Invalid crop range.');
            return;
        }

        const croppedVideo = document.createElement('video');
        croppedVideo.controls = true;
        croppedVideo.autoplay = true;

        const stream = video.captureStream();
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            croppedVideo.src = url;

            // Clear previous cropped video
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(croppedVideo);
            croppedVideo.play(); // Ensure the cropped video starts playing
        };

        // Reset the state before starting a new crop operation
        mediaPreview.innerHTML = '';
        video.currentTime = start;
        video.play();

        setTimeout(() => {
            video.pause();
            mediaRecorder.stop();
        }, (end - start) * 1000);
        video.innerHTML = '';

        mediaRecorder.start();
    });

    mediaControls.appendChild(cropStartInput);
    mediaControls.appendChild(cropEndInput);
    mediaControls.appendChild(cropButton);
    
}
window.cropMedia = cropMedia;

function adjustDuration() {
    alert('Adjust duration functionality is not implemented yet.');
}
function confirmPostStories() {
    if (confirm('Are you sure you want to post these stories?')) {
        addStories();
        closeAddStoryContainer();
        resetCropMedia();
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
