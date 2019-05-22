// The Game class is the main class for communication between each component.
class Game {
    constructor() {
	// Arrow functions to preserve context ("this")
	this.assManager = new AssetsManager();
	this.engine = new GameEngine(() => this.update(),
				     () => this.render(),
				     () => this.handleWinLoss());
	this.controller = undefined;
	this.model = undefined;
	this.view = undefined;
	this.endModalActive = false;
	this.currentLevel = parseInt(localStorage.getItem("level")) || 1;
	this.finalLevel = 6;
	this.startPageUrl = "Welcome_Page.html";
    }

    // Starts the game engine, game will update state and render 30 times/s.
    // The level configurations are stored in JSON files and will be read by
    // the AssetsManager object.
    start() {
	this.assManager.loadLevel(this.currentLevel, (data, tileset) => {
	    this.controller = new GameController();
	    this.model = new GameModel(data.tilemap.collision,
				       data.tilemap.shrimpPos,
				       data.tilemap.startTile,
				       data.tilemap.exitTile,
				       data.tilemap.size,
				       data.tileset.size,
				       data.tileset.frameSets);
	    this.view = new GameView(this.model.world.width,
				     this.model.world.height,
				     tileset,
				     data.tilemap.graphical,
				     data.tilemap.size,
				     data.tileset.size.tile);
	    
	    // Arrow function to preserve context ("this")
	    const keyChange = (e) => this.controller.keyChange(e.type,
							       e.keyCode);
	    // Make sure game respondes to arrow
	    // keys and resizing of the window.
	    window.addEventListener("keydown", keyChange);
	    window.addEventListener("keyup", keyChange);
	    window.addEventListener("resize", () => this.resize());

	    // Set up the buttons etc. of all modal
	    // dialogs that can occur during the level.
	    this.setUpPauseModal();
	    this.setUpFinishModal();
	    this.setUpLoseModal();
	    this.setUpFinalModal();

	    // Can disable light mask and wall collisions,
	    // mainly for debugging/demonstration purposes.
	    //this.disableMask = true;
	    //this.model.world.disableCollisions = true;

	    // Begin by making sure that game is scaled to the window
	    // correctly (this will also trigger an initial rendering), load
	    // the background music for the level and start the engine, which
	    // will update the model and render the view 30 times per second.
	    this.resize();
	    this.assManager.loadMusic(data.music.url, data.music.offset);
	    this.engine.start();
	});
    }

    // Checks if arrow keys are pressed or not and adds velocity to directions,
    // then updates the model; e.g. the player's position.
    update() {
	if (this.controller.left.active)  this.model.world.player.moveLeft();
	if (this.controller.up.active)    this.model.world.player.moveUp();
	if (this.controller.right.active) this.model.world.player.moveRight();
	if (this.controller.down.active)  this.model.world.player.moveDown();
	this.model.update();
    }

    // Renders the world; filling the background, rendering the player at its
    // position specified in the model.
    render() {
	// Draw tilemap onto buffer canvas
	this.view.drawMap();

	// Draw player onto buffer canvas
	let player = this.model.world.player;
	let playerFrame = player.animator.frame;
	this.view.drawObject(player, playerFrame);

	// Draw shrimp onto buffer canvas
	for (let shrimp of this.model.world.shrimp) {
	    let shrimpFrame = shrimp.animator.frame;
	    this.view.drawObject(shrimp, shrimpFrame);
	}
	
	// Draw light mask onto buffer canvas
	if (!this.disableMask)
	    this.view.drawLightMask(this.model.world.player.xCenter,
				    this.model.world.player.yCenter,
				    this.model.world.lightRadius);
	
	// Render everything onto real canvas
	this.view.render();
    }

    // Resizes and renders the game view when
    // the browser window size is adjusted.
    resize() {
	const domWidth = document.documentElement.clientWidth;
	const domHeight = document.documentElement.clientHeight;
	this.view.resize(domWidth, domHeight);
	this.view.render();
    }

    // Handles whatever terminated the level (finish/fail) by halting the
    // engine, stopping the level's background music, showing the appropriate
    // modal dialog and playing the appropriate music (success/fail).
    handleWinLoss() {
	let modal, musicFunc;
	
	if (this.model.world.finished) {
	    if (this.currentLevel == this.finalLevel) {
		modal = document.getElementById("modalFinal");
		musicFunc = this.assManager.playFinalMusic;
	    } else {
		modal = document.getElementById("modalFinish");
		musicFunc = this.assManager.playFinishMusic;
	    }
	} else if (this.model.world.gameOver) {
	    modal = document.getElementById("modalLose");
	    musicFunc = this.assManager.playFailMusic;
	} else {
	    return;
	}

	this.engine.stop();
	this.assManager.stopMusic();
	modal.classList.toggle("show-modal");
	musicFunc();
	this.endModalActive = true;
    }

    // Sets up the actions of the buttons in the 'pause' modal dialog, which
    // appears when the player presses the Escape button. The 'pause' dialog
    // allows for muting/unmuting all sounds and music, quitting to main menu
    // or resuming the game play.
    setUpPauseModal() {
	window.addEventListener("keypress", (e) => this.checkEscPressed(e));
	
	const btnResume = document.getElementById("pauseBtnResume");
	const btnToggleMute = document.getElementById("pauseBtnToggleMute");
	const btnQuit = document.getElementById("pauseBtnQuit");

	btnResume.addEventListener("click", () => {
	    var modal = document.getElementById("modalPause");
	    modal.classList.toggle("show-modal");
	    this.engine.start();
	});

	btnToggleMute.addEventListener("click", () => {
	    //this.assManager.music.muted = !this.assManager.music.muted;
	    //localStorage.setItem("muted", this.assManager.music.muted);
	    window.audioManager.toggleMuteAll();
	});

	btnQuit.addEventListener("click", () => {
	    location.replace(this.startPageUrl);
	});
    }

    // Sets up the actions of the buttons in the 'finish' modal dialog, which
    // appears when the player reaches the exit of the level. It will allow
    // the player to either continue to the next level or quit to the main menu.
    setUpFinishModal() {
	const btnNext = document.getElementById("finishBtnNext");
	const btnQuit = document.getElementById("finishBtnQuit");

	btnNext.addEventListener("click", () => {
	    localStorage.setItem("level", this.currentLevel + 1);
	    location.reload();
	});

	btnQuit.addEventListener("click", () => {
	    location.replace(this.startPageUrl);
	});
    }

    // Sets up the actions of the buttons in the 'fail' modal dialog, which
    // appears when the player collides with a wall. It will allow the player
    // to either try the level again from the start, or quit to the main menu. 
    setUpLoseModal() {
	const btnAgain = document.getElementById("loseBtnAgain");
	const btnQuit = document.getElementById("loseBtnQuit");

	btnAgain.addEventListener("click", () => {
	    location.reload();
	});

	btnQuit.addEventListener("click", () => {
	    location.replace(this.startPageUrl);
	});
    }

    // Sets up the actions of the buttons in the 'final' modal dialog, which
    // appears instead of the 'finish' modal dialog when the player reaches
    // the end of the final level. It will just congratulate the player on
    // finishing all levels and then allow for them to return to main menu.
    setUpFinalModal() {
	const btnQuit = document.getElementById("finalBtnQuit");

	btnQuit.addEventListener("click", () => {
	    location.replace(this.startPageUrl);
	});
    }
    
    // Shows pause menu if ESC key was pressed.
    checkEscPressed(event) {
	if (event.keyCode == 27 && !this.endModalActive) {
	    const modal = document.getElementById("modalPause");
	    modal.classList.toggle("show-modal");

	    if (this.engine.running) {
		this.engine.stop();
	    } else {
                this.engine.start();
	    }
	}
    }
}
