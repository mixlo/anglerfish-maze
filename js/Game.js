// The Game class is the main class for communication between each component.
class Game {
    constructor() {
	// Arrow functions to preserve context ("this")
	this.assManager = new AssetsManager();
	this.engine = new GameEngine(() => this.update(), () => this.render());
	this.controller = undefined;
	this.model = undefined;
	this.view = undefined;
    }

    // Starts the game engine, game will update state and render 30 times/s.
    // The level configurations are stored in JSON files and will be read by
    // the AssetsManager object.
    start() {
	this.assManager.loadLevel(Levels.LEVEL3, (data, tileset) => {
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
	    const keyChange = (e) => this.controller.keyChange(e.type, e.keyCode);
	    window.addEventListener("keydown", keyChange);
	    window.addEventListener("keyup", keyChange);
	    window.addEventListener("resize", () => this.resize());
	    
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
}

// Enum for all levels.
const Levels = {
    LEVEL1: 1,
    LEVEL2: 2,
    LEVEL3: 3,
    LEVEL4: 4,
    LEVEL5: 5,
    LEVEL6: 6
};
