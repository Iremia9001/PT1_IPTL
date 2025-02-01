import { socialbutton } from './ShowStorybuttons.js';


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
            storyElement.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = false;
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
                    title: title
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
        storyViewerContent.appendChild(mediaElement);
        updateProgressBar(5000, () => showStory(currentStoryIndex + 1));
    } else if (story.type === 'video') {
        mediaElement = document.createElement('video');
        mediaElement.src = story.src;
        mediaElement.autoplay = true;
        storyViewerContent.appendChild(mediaElement);

        mediaElement.onloadedmetadata = () => {
            updateProgressBar(mediaElement.duration * 1000, () => showStory(currentStoryIndex + 1));
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
    const likeButton = storyViewer.querySelector('.like-button');
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
