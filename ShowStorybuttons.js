const storyViewer = document.getElementById('storyViewer');
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

    listofbuttons.appendChild(reactionsContainer);
    listofbuttons.appendChild(activereaction);
    reactionsContainer.style.visibility = 'hidden';

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
        

            setTimeout(function () {
                reactionsParent.classList.remove('wave');
            }, 875);
        });
    });

    // Show reactions on hover
    activereaction.addEventListener('mouseenter', function () {
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

    // Add comment section
    const commentSection = document.createElement('div');
    commentSection.classList.add('comment-section');
    commentSection.style.display = 'none'; // Initially hide the comment section

    const commentList = document.createElement('ul');
    commentList.classList.add('comment-list');
    commentSection.appendChild(commentList);

    const commentForm = document.createElement('form');
    commentForm.classList.add('comment-form');
    commentForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const commentInput = commentForm.querySelector('input');
        const commentText = commentInput.value.trim();
        if (commentText) {
            const commentItem = document.createElement('li');
            commentItem.classList.add('comment-item');
            commentItem.innerHTML = '<i class="fa fa-user" aria-hidden="true"></i> ' + commentText;
            commentList.appendChild(commentItem);
            commentInput.value = '';
        }
    });

    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'Add a comment...';
    commentForm.appendChild(commentInput);

    const commentSubmitButton = document.createElement('button');
    commentSubmitButton.type = 'submit';
    commentSubmitButton.textContent = 'Post';
    commentForm.appendChild(commentSubmitButton);

    commentSection.appendChild(commentForm);

    // Add close button to comment section
    const closeCommentButton = document.createElement('button');
    closeCommentButton.innerHTML = '<i class="fa fa-window-close" aria-hidden="true"></i>';
    closeCommentButton.classList.add('close-comment-button');
    closeCommentButton.addEventListener('click', () => {
        commentSection.style.display = 'none';
    });
    commentSection.appendChild(closeCommentButton);

    // Add event listener to comment button to show comment section
    commentButton.addEventListener('click', () => {
        if (!storyViewerContent.contains(commentSection)) {
            storyViewerContent.appendChild(commentSection);
        }
        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
    });

    storyViewerContent.appendChild(socialButtons);
    storyViewerContent.appendChild(commentSection); // Ensure comment section is appended to storyViewerContent
}