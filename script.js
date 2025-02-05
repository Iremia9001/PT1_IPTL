import { socialbutton } from './ShowStorybuttons.js';

const storiesContainer = document.getElementById('storiesContainer');
const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');
const storyViewerTitle = document.getElementById('storyViewerTitle');
const progressBar = document.getElementById('progressBar');
const startHandle = document.getElementById('startHandle');
const endHandle = document.getElementById('endHandle');
const timelineRange = document.getElementById('timelineRange');
const startValue = document.getElementById('startValue');
const endValue = document.getElementById('endValue');
const dynamicTimeLabel = document.getElementById('dynamicTimeLabel');
const currentStartTimeValue = document.getElementById('currentStartTimeValue');
const currentEndTimeValue = document.getElementById('currentEndTimeValue');
const timelineContainer = document.getElementById('timelineContainer');

let storyQueue = [];
let storyTitles = [];
let currentStoryIndex = 0;
let progressTimeout;
let draggingHandle = null;
let videoDuration = 15; // Default duration
    
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
            video.dataset.startTime = startValue.textContent;
            video.dataset.endTime = endValue.textContent;
            video.loading = 'lazy';
            video.controlsList = "nodownload nofullscreen noremoteplayback noplaybackrate novolume"; // Remove additional controls
            video.disablePictureInPicture = true;
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
                    scale: child.querySelector('img, video').dataset.scale,
                    startTime: child.querySelector('video') ? child.querySelector('video').dataset.startTime : null,
                    endTime: child.querySelector('video') ? child.querySelector('video').dataset.endTime : null
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
        timelineContainer.style.display = 'none'; // Hide timeline slider for images
        updateProgressBar(5000, () => showStory(currentStoryIndex + 1));
    } else if (story.type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = story.src;
        mediaElement.autoplay = true;
        mediaElement.style.transform = `scale(${story.scale})`;
        mediaElement.loading = 'lazy';
        mediaElement.controlsList = "nodownload nofullscreen noremoteplayback noplaybackrate novolume"; // Remove additional controls
        mediaElement.disablePictureInPicture = true;
        storyViewerContent.appendChild(mediaElement);
        timelineContainer.style.display = 'block'; // Show timeline slider for videos

        mediaElement.onloadedmetadata = () => {
            videoDuration = mediaElement.duration;
            updateTimelineHandles();
            startValue.textContent = story.startTime || '0';
            endValue.textContent = story.endTime || Math.min(videoDuration, 15).toFixed(1);
            currentStartTimeValue.textContent = startValue.textContent;
            currentEndTimeValue.textContent = endValue.textContent;
            mediaElement.currentTime = parseFloat(startValue.textContent);
            const playDuration = (parseFloat(endValue.textContent) - parseFloat(startValue.textContent)) * 1000;
            updateProgressBar(playDuration, () => showStory(currentStoryIndex + 1));
        };

        mediaElement.ontimeupdate = () => {
            if (mediaElement.currentTime >= parseFloat(endValue.textContent)) {
                mediaElement.pause();
                showStory(currentStoryIndex + 1);
            }
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
            timelineContainer.style.display = 'none'; // Hide timeline slider for images
        } else if (file.type.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.src = url;
            mediaElement.controls = false;
            mediaElement.controlsList = "nodownload nofullscreen noremoteplayback noplaybackrate novolume"; // Remove additional controls
            mediaElement.disablePictureInPicture = true;
            mediaElement.loading = 'lazy';
            timelineContainer.style.display = 'block'; // Show timeline slider for videos
            mediaElement.onloadedmetadata = () => {
                videoDuration = mediaElement.duration;
                updateTimelineHandles();
                startValue.textContent = '0';
                endValue.textContent = Math.min(videoDuration, 15).toFixed(1); // Ensure max duration is 15
                currentStartTimeValue.textContent = '0';
                currentEndTimeValue.textContent = Math.min(videoDuration, 15).toFixed(1);
                dynamicTimeLabel.style.display = 'block'; // Show the dynamic time label
                mediaElement.currentTime = parseFloat(startValue.textContent);
                mediaElement.play();
                mediaElement.ontimeupdate = () => {
                    if (mediaElement.currentTime >= parseFloat(endValue.textContent)) {
                        mediaElement.pause();
                    }
                };
            };
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
        dynamicTimeLabel.style.display = 'none'; // Hide the dynamic time label
    }
}
window.previewMedia = previewMedia;

function updateTimelineHandles() {
    const containerWidth = timelineContainer.offsetWidth;
    const startPercent = parseFloat(startValue.textContent) / videoDuration * 100;
    const endPercent = parseFloat(endValue.textContent) / videoDuration * 100;

    startHandle.style.left = `${Math.max(startPercent, 0)}%`;
    endHandle.style.left = `${Math.min(endPercent, 100)}%`;
    timelineRange.style.left = `${Math.max(startPercent, 0)}%`;
    timelineRange.style.width = `${Math.min(endPercent, 100) - Math.max(startPercent, 0)}%`;

    currentStartTimeValue.textContent = startValue.textContent;
    currentEndTimeValue.textContent = endValue.textContent;

    // Update the preview video to reflect the new start and end times
    const mediaElement = mediaPreview.querySelector('video');
    if (mediaElement) {
        mediaElement.currentTime = parseFloat(startValue.textContent);
        mediaElement.play();
        mediaElement.ontimeupdate = () => {
            if (mediaElement.currentTime >= parseFloat(endValue.textContent)) {
                mediaElement.pause();
            }
        };
    }
}

function handleDrag(event) {
    if (!draggingHandle) return;

    const containerWidth = timelineContainer.offsetWidth;
    const rect = timelineContainer.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (offsetX / containerWidth) * 100));
    const time = (percent / 100) * videoDuration;

    if (draggingHandle === startHandle) {
        if (time >= parseFloat(endValue.textContent) || (parseFloat(endValue.textContent) - time) > 15) return;
        startValue.textContent = time.toFixed(1);
    } else if (draggingHandle === endHandle) {
        if (time <= parseFloat(startValue.textContent) || (time - parseFloat(startValue.textContent)) > 15) return;
        endValue.textContent = time.toFixed(1);
    } else if (draggingHandle === timelineRange) {
        const duration = parseFloat(endValue.textContent) - parseFloat(startValue.textContent);
        let newStartTime = time - (duration / 2);
        let newEndTime = time + (duration / 2);

        if (newStartTime < 0) {
            newStartTime = 0;
            newEndTime = duration;
        } else if (newEndTime > videoDuration) {
            newEndTime = videoDuration;
            newStartTime = videoDuration - duration;
        }

        startValue.textContent = newStartTime.toFixed(1);
        endValue.textContent = newEndTime.toFixed(1);
    }

    updateTimelineHandles();
}

startHandle.addEventListener('mousedown', () => {
    draggingHandle = startHandle;
});

endHandle.addEventListener('mousedown', () => {
    draggingHandle = endHandle;
});

timelineRange.addEventListener('mousedown', () => {
    draggingHandle = timelineRange;
});

document.addEventListener('mousemove', handleDrag);
document.addEventListener('mouseup', () => {
    draggingHandle = null;
});

function discardMedia() {
    const mediaInput = document.getElementById('mediaInput');
    const mediaPreview = document.getElementById('mediaPreview');
    const storyTitleInput = document.getElementById('storyTitle');
    const mediaControls = document.getElementById('mediaControls');
    const zoomSlider = document.getElementById('zoomSlider');
    const discardButton = document.getElementById('discardButton');
    const postStoriesButton = document.getElementById('postStoriesButton');
    const dynamicTimeLabel =document.getElementById('dynamicTimeLabel');

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
    dynamicTimeLabel.style.display = 'none'; // Hide the dynamic time label
    resetZoomSlider(); // Reset zoom slider
}
window.discardMedia = discardMedia;

function closemediaInput() {
    document.querySelector('.file-attachment').style.display = 'none';
}

function openAddStoryContainer() {
    document.getElementById('addStoryContainer').style.display = 'block';
    document.getElementById('mediaInput').value = '';
    document.getElementById('storyTitle').value = '';
    document.getElementById('mediaPreview').innerHTML = '';
    document.getElementById('storyTitle').style.display = 'none';
    document.getElementById('mediaControls').style.display = 'none';
    dynamicTimeLabel.style.display = 'none'; // Hide the dynamic time label
    resetZoomSlider(); // Reset zoom slider
}
window.openAddStoryContainer = openAddStoryContainer;

function closeAddStoryContainer() {
    discardMedia();
    document.getElementById('addStoryContainer').style.display = 'none';
}
window.closeAddStoryContainer = closeAddStoryContainer;

function resetZoomSlider() {
    const zoomSlider = document.getElementById('zoomSlider');
    zoomSlider.value = 1; // Reset to center value
    zoomMedia(); // Apply the reset value
}


