const storyViewerContent = document.getElementById('storyViewerContent');

export function socialbutton() {
    const socialButtons = document.createElement('div');
    socialButtons.classList.add('social-buttons');

    const listofbuttons = document.createElement('ul');
    listofbuttons.classList.add('list-of-buttons');
    socialButtons.appendChild(listofbuttons);

    const activereaction = document.createElement('li');
    activereaction.classList.add('like-button');

    const likeDiv = document.createElement('div');
    likeDiv.classList.add('like');
    const likeSpan = document.createElement('span');
    likeSpan.classList.add('fas', 'fa-thumbs-up');
    likeDiv.appendChild(likeSpan);
    activereaction.appendChild(likeDiv);

    const reactionsContainer = document.createElement('div');
    reactionsContainer.classList.add('reactions');

    const likeReaction = document.createElement('div');
    likeReaction.classList.add('like');
    const likeReactionSpan = document.createElement('span');
    likeReactionSpan.classList.add('fas', 'fa-thumbs-up');
    likeReaction.appendChild(likeReactionSpan);

    const loveReaction = document.createElement('div');
    loveReaction.classList.add('love');
    const loveReactionSpan = document.createElement('span');
    loveReactionSpan.classList.add('fas', 'fa-heart');
    loveReaction.appendChild(loveReactionSpan);

    const laughReaction = document.createElement('div');
    laughReaction.classList.add('laugh');
    const laughReactionSpan = document.createElement('span');
    laughReactionSpan.classList.add('fa-solid', 'fa-face-laugh-squint');
    laughReaction.appendChild(laughReactionSpan);

    const cryReaction = document.createElement('div');
    cryReaction.classList.add('cry');
    const cryReactionSpan = document.createElement('span');
    cryReactionSpan.classList.add('fa-sharp', 'fa-solid', 'fa-face-sad-tear');
    cryReaction.appendChild(cryReactionSpan);

    reactionsContainer.appendChild(likeReaction);
    reactionsContainer.appendChild(loveReaction);
    reactionsContainer.appendChild(laughReaction);
    reactionsContainer.appendChild(cryReaction);

    activereaction.appendChild(reactionsContainer);
    listofbuttons.appendChild(activereaction);

    // Comment button
    const commentButton = document.createElement('li');
    commentButton.classList.add('comment-button');
    commentButton.innerHTML = '<i class="fa fa-comments-o" aria-hidden="true"></i>';

    listofbuttons.appendChild(commentButton);

    // Share button
    const shareButton = document.createElement('li');
    shareButton.classList.add('share-button');
    shareButton.innerHTML = '<i class="fa fa-paper-plane-o" aria-hidden="true"></i>';

    listofbuttons.appendChild(shareButton);

    storyViewerContent.appendChild(socialButtons);

    // Add event listeners for reactions
    const reactions = reactionsContainer.querySelectorAll('.reactions > div');
    const reactionsParent = reactionsContainer;

    reactions.forEach(reaction => {
        reaction.addEventListener('click', function (event) {
            event.stopImmediatePropagation();
            reactionsParent.classList.add('wave');

            reactions.forEach(reaction => {
                reaction.classList.remove('active');
            });

            reaction.classList.add('active');

            // Update the like button to show the selected reaction
            activereaction.innerHTML = '';
            activereaction.appendChild(reaction.cloneNode(true));
            activereaction.appendChild(reactionsContainer);

            setTimeout(function () {
                reactionsParent.classList.remove('wave');
            }, 875);
        });
    });

    // Show reactions on hover
    activereaction.addEventListener('mouseenter', function () {
        activereaction.appendChild(reactionsContainer); // Add the reactions container
        reactionsContainer.style.visibility = 'visible';
        reactionsContainer.style.opacity = '1';
    });

    activereaction.addEventListener('mouseleave', function () {
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