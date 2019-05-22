/*Adding sounds for the welcome page of the game*/

const bubble_sound = new Audio();
bubble_sound.src = "audio/bubbles.mp3";

const intro_sound = new Audio();
intro_sound.src = "audio/chiptune.mp3"

function toggleSoundBackground() {
    return intro_sound.paused ? intro_sound.play() : intro_sound.pause();
}

function toggleSoundBtns() {
    if (intro_sound.paused) {
        bubble_sound.paused;
    } else {
        document.getElementById("soundImg").src="images/sound_on.png"
        bubble_sound.play();
    }
}

function changeImage(){
    if(intro_sound.played){
        document.getElementById("soundImg").src="images/sound_on.png"
    }
    
    if(intro_sound.paused){
        document.getElementById("soundImg").src="images/sound_off.png"
    }
}
