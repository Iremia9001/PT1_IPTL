const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');


export function socialbutton(){
    const socialButtons = document.createElement('div');
    socialButtons.classList.add('social-buttons');
    socialButtons.innerHTML = `like share commentasdfffffffffffffffffffffffffffffff`;
    storyViewerContent.appendChild(socialButtons);
}