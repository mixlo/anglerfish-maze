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
	this.finalLevel = 5;
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
	    window.addEventListener("keydown", keyChange);
	    window.addEventListener("keyup", keyChange);
	    window.addEventListener("resize", () => this.resize());

	    this.setUpPauseModal();
	    this.setUpFinishModal();
	    this.setUpLoseModal();
	    this.setUpFinalModal();

	    this.resize();
	    this.assManager.loadMusic(data.music.url);
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
	//this.view.drawLightMask(this.model.world.player.xCenter,
	//			this.model.world.player.yCenter,
	//			this.model.world.lightRadius);
		
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

    handleWinLoss() {
	let modal;
	
	if (this.model.world.finished) {
	    if (this.currentLevel == this.finalLevel) {
		modal = document.getElementById("modalFinal");
	    } else {
		modal = document.getElementById("modalFinish");
	    }
	} else if (this.model.world.gameOver) {
	    modal = document.getElementById("modalLose");
	} else {
	    return;
	}

	modal.classList.toggle("show-modal");
	this.engine.stop();
	this.endModalActive = true;
    }

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
	    this.assManager.music.muted = !this.assManager.music.muted;
	    localStorage.setItem("muted", this.assManager.music.muted);
	});

	btnQuit.addEventListener("click", () => {
	    location.replace("Home_page.html");
	});
    }

    setUpFinishModal() {
	const btnNext = document.getElementById("finishBtnNext");
	const btnQuit = document.getElementById("finishBtnQuit");

	btnNext.addEventListener("click", () => {
	    localStorage.setItem("level", this.currentLevel + 1);
	    location.reload();
	});

	btnQuit.addEventListener("click", () => {
	    location.replace("Home_page.html");
	});
    }

    setUpLoseModal() {
	const btnAgain = document.getElementById("loseBtnAgain");
	const btnQuit = document.getElementById("loseBtnQuit");

	btnAgain.addEventListener("click", () => {
	    location.reload();
	});

	btnQuit.addEventListener("click", () => {
	    location.replace("Home_page.html");
	});
    }

    setUpFinalModal() {
	const btnQuit = document.getElementById("finalBtnQuit");

	btnQuit.addEventListener("click", () => {
	    location.replace("Home_page.html");
	});
    }
    
    // Shows pause menu if ESC key was pressed
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
