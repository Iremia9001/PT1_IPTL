const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');

// buustons

export function socialbutton(){
    const socialButtons = document.createElement('div');
    socialButtons.classList.add('social-buttons');

    // Create list of buttons
    const listofbuttons = document.createElement('ul');
    listofbuttons.classList.add('list-of-buttons');

    socialButtons.appendChild(listofbuttons);

    // Like button
    const likeButton = document.createElement('li');
    likeButton.classList.add('like-button');
    likeButton.innerHTML = '<button>Like</button>';

    // Reactions container
    const reactionsContainer = document.createElement('div');
    reactionsContainer.classList.add('reactions');
    reactionsContainer.innerHTML = `
        <div class="like"><span class="fas fa-thumbs-up"></span></div>
        <div class="love"><span class="fas fa-heart"></span></div>
        <div class="laugh"><span class="fa-solid fa-face-laugh-squint"></span></div>
        <div class="cry"><span class="fa-sharp fa-solid fa-face-sad-tear"></span></div>
    `;
    likeButton.appendChild(reactionsContainer);

    listofbuttons.appendChild(likeButton);

    // Comment button
    const commentButton = document.createElement('li');
    commentButton.classList.add('comment-button');
    commentButton.innerHTML = '<button>Comment</button>';

    listofbuttons.appendChild(commentButton);

    // Share button
    const shareButton = document.createElement('li');
    shareButton.classList.add('share-button');
    shareButton.innerHTML = '<button>Share</button>';

    listofbuttons.appendChild(shareButton);

    storyViewerContent.appendChild(socialButtons);

    // Add event listeners for reactions
    const reactions = reactionsContainer.querySelectorAll('.reactions > div');
    const reactionsParent = reactionsContainer;

    reactions.forEach(reaction => {
        reaction.addEventListener('click', function () {
            reactionsParent.classList.add('wave');

            reactions.forEach(reaction => {
                reaction.classList.remove('active');
            });

            reaction.classList.add('active');

            setTimeout(function () {
                reactionsParent.classList.remove('wave');
            }, 875);
        });
    });

    // Demo heart reaction
    

    // Show reactions on hover
likeButton.addEventListener('mouseenter', function () {
    reactionsContainer.style.visibility = 'visible';
    reactionsContainer.style.opacity = '1';
});

likeButton.addEventListener('mouseleave', function () {
    setTimeout(function () {
        if (!reactionsContainer.matches(':hover')) {
            reactionsContainer.style.visibility = 'hidden';
            reactionsContainer.style.opacity = '0';
        }
    }, 100);
});

reactionsContainer.addEventListener('mouseenter', function () {
    reactionsContainer.style.visibility = 'visible';
    reactionsContainer.style.opacity = '1';
});

reactionsContainer.addEventListener('mouseleave', function () {
    reactionsContainer.style.visibility = 'hidden';
    reactionsContainer.style.opacity = '0';
});
 
}