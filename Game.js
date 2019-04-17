// The Game class is the main class for communication between each component.
class Game {
    constructor() {
	const canvas = document.querySelector("canvas");
	// Arrow functions to preserve context ("this")
	this.engine = new GameEngine(() => this.update(), () => this.render());
	this.controller = new GameController();
	this.model = new GameModel();
	this.view = new GameView(canvas,
				 this.model.world.width,
				 this.model.world.height);

	// Arrow function to preserve context ("this")
	const keyChange = (e) => this.controller.keyChange(e.type, e.keyCode);
	window.addEventListener("keydown", keyChange);
	window.addEventListener("keyup", keyChange);
	window.addEventListener("resize", this.resize);
    }

    // Starts the game engine, game will update state and render 30 times/s.
    start() {
	this.resize();
	this.engine.start();
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
	this.view.fillBg(this.model.world.bgColor);
	this.view.drawRect(this.model.world.player.x,
			   this.model.world.player.y,
			   this.model.world.player.width,
			   this.model.world.player.height,
			   this.model.world.player.color);
	this.view.render();
    }

    // Resizes and renders the game view when the browser window size is
    // adjusted. Doesn't work flawlessly as of now, will fix.
    resize() {
	const domWidth = document.documentElement.clientWidth - 32;
	const domHeight = document.documentElement.clientHeight - 32;
	this.view.resize(domWidth, domHeight);
	this.view.render();
    }
}
