// The GameView class is responsible for rendering the game.
class GameView {
    constructor(canvas, worldWidth, worldHeight) {
	this.context = canvas.getContext("2d");
	// A buffer canvas is used to make rendering smoother, but also to
	// make is possible to resize the game. The buffer canvas will always
	// have the exact size as the game world, while the visible canvas
	// will resize and scale depending on browser window size.
	const bufferCanvas = document.createElement("canvas");
	bufferCanvas.width = worldWidth;
	bufferCanvas.height = worldHeight;
	this.buffer = bufferCanvas.getContext("2d");
	this.worldWidth = worldWidth;
	this.worldHeight = worldHeight;
    }

    // Renders everything that is drawn on the buffer canvas
    // onto the actual canvas.
    render() {
	this.context.drawImage(this.buffer.canvas,
			       0, 0,
			       this.buffer.canvas.width,
			       this.buffer.canvas.height,
			       0, 0,
			       this.context.canvas.width,
			       this.context.canvas.height)
    }

    // Handles resizing, taking game world size aspect ratio into account.
    resize(domHeight, domWidth) {
	const worldAspRat = this.worldHeight / this.worldWidth;
	
	if (domHeight / domWidth > worldAspRat) {
	    this.context.canvas.height = domWidth * worldAspRat;
	    this.context.canvas.width = domWidth;
	} else {
	    this.context.canvas.height = domHeight;
	    this.context.canvas.width = domHeight / worldAspRat;
	}
	
	// To preserve pixel sharpness in pixel art
	// Is set to true upon resize, need to reset to false
	this.imageSmoothingEnabled = false;
    }

    // Fills the background with the specified color.
    fillBg(color) {
	this.buffer.fillStyle = color;
	this.buffer.fillRect(0, 0,
			     this.buffer.canvas.width,
			     this.buffer.canvas.height);
    }

    // Draws a rectangle of the specified size at the specified coordinates.
    drawRect(x, y, width, height, color) {
	this.buffer.fillStyle = color;
	this.buffer.fillRect(Math.floor(x), Math.floor(y), width, height);
    }
}
