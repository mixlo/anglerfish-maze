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

    drawPlayer(rectangle, color1, color2) {
	this.buffer.fillStyle = color1;
	this.buffer.fillRect(Math.round(rectangle.x),
			     Math.round(rectangle.y),
			     rectangle.width,
			     rectangle.height);
	this.buffer.fillStyle = color2;
	this.buffer.fillRect(Math.round(rectangle.x + 2),
			     Math.round(rectangle.y + 2),
			     rectangle.width - 4,
			     rectangle.height - 4);
    }

    drawMap() {
	for (let row = 0; row < this.tilemapSize.rows; row++) {
	    for (let col = 0; col < this.tilemapSize.cols; col++) {
		let tile = this.tilemap[row][col];
		let srcY = tile[0] * this.tileSize;
		let srcX = tile[1] * this.tileSize;
		let dstY = row * this.tileSize;
		let dstX = col * this.tileSize;
		
		this.buffer.drawImage(this.tileset,
				      srcX, srcY, this.tileSize, this.tileSize,
				      dstX, dstY, this.tileSize, this.tileSize);
	    }
	}
    }

    drawObject(object, frame) {
	//let dstY = Math.round(object.y + frame.offsetY);
	//let dstX = Math.round(object.x +
	//		      Math.floor(object.width*0.5 - frame.width*0.5) +
	//		      frame.offsetX);
    
	//this.buffer.drawImage(this.tileset,
	//		      frame.x, frame.y, frame.width, frame.height,
	//		      dstX, dstY, object.width, object.height);

	this.buffer.drawImage(this.tileset,
			      frame.x, frame.y, frame.width, frame.height,
			      object.x, object.y, object.width, object.height);
    }

    drawShrimp(shrimp) {
	
    }

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

    updateBlurValue() {
	if (this.blur < this.blurMin || this.blur > this.blurMax)
	    this.blurChange = -this.blurChange;

	this.blur += this.blurChange;
    }
}
