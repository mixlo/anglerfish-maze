// The GameView class is responsible for rendering the game.
class GameView {
    constructor(worldWidth, worldHeight,
		tileset, tilemap, tilemapSize, tileSize) {
	// A buffer canvas is used to make rendering smoother, but also to
	// make is possible to resize the game. The buffer canvas will always
	// have the exact size as the game world, while the visible canvas
	// will resize and scale depending on browser window size.
	this.context = document.querySelector("canvas").getContext("2d");
	this.buffer = document.createElement("canvas").getContext("2d");
	this.buffer.canvas.width = worldWidth;
	this.buffer.canvas.height = worldHeight;
	this.buffer.imageSmoothingEnabled = false;
	this.worldWidth = worldWidth;
	this.worldHeight = worldHeight;
	this.tileset = tileset;
	this.tilemap = tilemap;
	this.tilemapSize = tilemapSize;
	this.tileSize = tileSize;

	// We create a glowing light effect around the anglerfish by setting
	// a yellow blur along the edges of the circle surrounding the fish.
	// To create the glowing effect, we continuously change the blur value
	// back and forth between a minimum and a maximum value.
	this.blurMin = 10;
	this.blurMax = 30;
	this.blurChange = 1;
	this.blur = this.blurMin;
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
			       this.context.canvas.height);
    }

    // Handles resizing, taking game world size aspect ratio into account.
    resize(domWidth, domHeight) {
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
	this.context.imageSmoothingEnabled = false;
    }

    // Draws the tilemap onto the world.
    drawMap() {
	for (let row = 0; row < this.tilemapSize.rows; row++) {
	    for (let col = 0; col < this.tilemapSize.cols; col++) {
		const tile = this.tilemap[row][col];
		const srcY = tile[0] * this.tileSize;
		const srcX = tile[1] * this.tileSize;
		const dstY = row * this.tileSize;
		const dstX = col * this.tileSize;
		
		this.buffer.drawImage(this.tileset,
				      srcX, srcY, this.tileSize, this.tileSize,
				      dstX, dstY, this.tileSize, this.tileSize);
	    }
	}
    }

    // Generic method used to draw any object, e.g. the player and shrimp.
    drawObject(object, frame, center=false) {
	this.buffer.drawImage(this.tileset,
			      frame.x, frame.y, frame.width, frame.height,
			      object.x, object.y, object.width, object.height);
    }

    // The entire game world will be completely dark except for a circle
    // around the fish. To create this effect, we create a "mask" on top
    // of the tilemap. The edge of the circle around the fish is blurred
    // in yellow to create a glowing light effect.
    drawLightMask(x, y, rad) {
	// Update blur size
	this.updateBlurValue()
	// Save and restore to prevent shadow on everything else.
	this.buffer.save();
	this.buffer.beginPath();
	this.buffer.arc(x, y, rad, 0, 2 * Math.PI, true);
	this.buffer.rect(0, 0, this.worldWidth, this.worldHeight);
	this.buffer.shadowColor = "yellow";
	this.buffer.shadowBlur = this.blur;
	this.buffer.shadowOffsetX = 0;
	this.buffer.shadowOffsetY = 0;
	this.buffer.fillStyle = "black";
	this.buffer.fill();
	this.buffer.closePath();
	this.buffer.restore();
    }

    // This updates the blur value, by increasing/decreasing it with the blur
    // change value. The blur change value is negated when the blur value
    // reaches either its maximum or minimum limit.
    updateBlurValue() {
	if (this.blur < this.blurMin || this.blur > this.blurMax)
	    this.blurChange = -this.blurChange;

	this.blur += this.blurChange;
    }
}
