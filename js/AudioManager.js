// The AudioManager is instantiated on each web page of the game.
// It takes care of all sounds and music and makes sure not to play them
// if the game has been muted.
class AudioManager {
    constructor() {
	// Background music in main menu.
	this.introMusic = new Audio();
	this.introMusic.src = "audio/chiptune.mp3";
	this.introMusic.loop = true;

	// Bubble sounds for buttons in options menu.
	this.bubbleSound = new Audio();
	this.bubbleSound.src = "audio/bubbles.mp3";

	// Bubble pop sounds for when hovering buttons in main menu.
	// Higher playback rate makes the pop go faster, in case player
	// hovers over multiple buttons very fast.
	this.bubblePopSound = new Audio();
	this.bubblePopSound.src = "audio/bubble_pop.mp3";
	this.bubblePopSound.playbackRate = 1.7;

	// Background music in options menu, only silence for 3 seconds
	// in the beginning of the track, so currentTime is set to 3
	// initially to skip the silence.
	this.optionsMusic = new Audio();
	this.optionsMusic.src = "audio/caves.mp3";
	this.optionsMusic.currentTime = 3;
	this.optionsMusic.loop = true;

	// Background music in the tutorial, offset 3 seconds.
	this.tutorialMusic = new Audio();
	this.tutorialMusic.src = "audio/skull_pirates.mp3";
	this.tutorialMusic.currentTime = 3;
	this.tutorialMusic.loop = true;

	// Music that plays when the player clears a level.
	this.finishMusic = new Audio();
	this.finishMusic.src = "audio/get_item.mp3";
	this.finishMusic.currentTime = 1;

	// Music that plays when the player dies.
	this.failMusic = new Audio();
	this.failMusic.src = "audio/error.mp3";

	// Music that plays when the player finishes the last level.
	this.finalMusic = new Audio();
	this.finalMusic.src = "audio/get_element.mp3";
	this.finalMusic.currentTime = 2;

	// The background music for each level will be loaded dynamically from
	// the game's AssetsManager.
	this.levelMusic = null;

	// The game shall initially be muted.
	this.muted = true;
	this.update();
    }

    // Update checks the localStorage for any saved information on whether the
    // game has been muted or unmuted earlier, then mutes or unmutes all
    // sounds based on that. It also updates the sound icon in the top left
    // corner of the start page to correspond with the current mute setting.
    update() {
	this.muted = localStorage.getItem("soundon") != "true";
	this.introMusic.muted = this.muted;
	this.bubbleSound.muted = this.muted;
	this.bubblePopSound.muted = this.muted;
	this.optionsMusic.muted = this.muted;
	this.tutorialMusic.muted = this.muted;
	this.finishMusic.muted = this.muted;
	this.failMusic.muted = this.muted;
	this.finalMusic.muted = this.muted;
	if (this.levelMusic)
	    this.levelMusic.muted = this.muted;
	this.changeSoundImage();
    }

    // Mutes all sounds.
    muteAll() {
	localStorage.setItem("soundon", false);
	this.update();
    }

    // Unmutes all sounds.
    unmuteAll() {
	localStorage.setItem("soundon", true);
	this.update();
    }

    // Reverses the current mute setting for all sounds.
    toggleMuteAll() {
	localStorage.setItem("soundon", this.muted);
	this.update();
    }

    // Updates the sound icon image on the start page
    // to correspond to the current mute setting.
    changeSoundImage() {
	const img = document.getElementById("soundImg");
	if (img) {
	    if (this.muted) img.src = "images/sound_off.png";
	    else            img.src = "images/sound_on.png";
	}
    }

    // Methods to start playing each respective sound/music.
    playIntroMusic()     { this.introMusic.play();     }
    playBubbleSound()    { this.bubbleSound.play();    }
    playBubblePopSound() { this.bubblePopSound.play(); }
    playOptionsMusic()   { this.optionsMusic.play();   }
    playTutorialMusic()  { this.tutorialMusic.play();  }
    playFinishMusic()    { this.finishMusic.play();    }
    playFailMusic()      { this.failMusic.play();      }
    playFinalMusic()     { this.finalMusic.play();     }

    // Dynamically initializes the level's background music
    // with a specified offset, if needed.
    initLevelMusic(musicUrl, offset) {
	this.levelMusic = new Audio(musicUrl);
	this.levelMusic.currentTime = offset;
	this.levelMusic.muted = this.muted;
	this.levelMusic.loop = true;
	this.levelMusic.play();
    }

    // Stops the level's background music, used e.g.
    // when the player finishes a level or dies.
    stopLevelMusic() { this.levelMusic.pause(); }
}

// Instantiate a global AudioManager object as soon as the page loads.
window.audioManager = new AudioManager();
