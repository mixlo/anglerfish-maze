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

	// Assumes that these images are loaded in the tutorial page.
	// Since these variables are only used in the tutorial page, it
	// doesn't matter if they are undefined in real game page.
	this.arrowUpImg = document.getElementById("arrowUp");
	this.arrowDownImg = document.getElementById("arrowDown");
	this.arrowLeftImg = document.getElementById("arrowLeft");
	this.arrowRightImg = document.getElementById("arrowRight");
	this.squareImg = document.getElementById("square");

	// To preserve pixel sharpness in pixel art, the imageSmoothingEnabled
	// property on the canvas context needs to be false. We always set it
	// to false on the buffer canvas, but we make it possible to toggle it
	// on the real canvas, since it is useful to set it to true when
	// displaying text in the popups in the tutorial.
	this.shouldUseImageSmoothing = false;
	this.context.imageSmoothingEnabled = this.shouldUseImageSmoothing;
	this.buffer.imageSmoothingEnabled = false;
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
	
	// To preserve pixel sharpness in pixel art.
	// Is set to true upon resize, need to reset it.
	this.context.imageSmoothingEnabled = this.shouldUseImageSmoothing;
	this.buffer.imageSmoothingEnabled = false;
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

    // Method to toggle whether image smoothing should be used.
    // Useful for the tutorial.
    useImageSmoothing(enabled) {
	this.shouldUseImageSmoothing = enabled;
	this.context.imageSmoothingEnabled = this.shouldUseImageSmoothing;
    }



    // Draw method for Welcome popup in tutorial.
    drawTutPopWelcome() {
	const sqWidth = this.tileSize * 5.5;
	const sqHeight = this.tileSize * 1.5;
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth/2 - sqWidth/2,
			      this.worldHeight/2 - sqHeight/2 - 3,
			      sqWidth,
			      sqHeight);
	this.buffer.font = "12px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutwelcome1"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 20);
	this.buffer.fillText(window.currentLanguage["tutwelcome2"],
			     this.worldWidth/2,
			     this.worldHeight/2);
	this.buffer.fillText(window.currentLanguage["tutwelcome3"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 20);
    }

    // Draw method for Fish popup in tutorial.
    drawTutPopFish() {
	this.buffer.drawImage(this.squareImg,
			      this.tileSize/2-8,
			      this.tileSize*2,
			      this.tileSize*3.3,
			      this.tileSize*0.9);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutfish1"],
			     this.tileSize*2,
			     this.worldHeight/2 - 15);
	this.buffer.fillText(window.currentLanguage["tutfish2"],
			     this.tileSize*2,
			     this.worldHeight/2);
	this.buffer.fillText(window.currentLanguage["tutfish3"],
			     this.tileSize*2,
			     this.worldHeight/2 + 15);
	this.buffer.drawImage(this.arrowLeftImg,
			      this.tileSize,
			      this.tileSize + 10,
			      this.tileSize, this.tileSize);
    }

    // Draw method for Finish popup in tutorial.
    drawTutPopFinish() {
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth - this.tileSize*2.5,
			      this.worldHeight - this.tileSize*2.7,
			      this.tileSize*2.4,
			      this.tileSize*0.7);
	this.buffer.font = "10px Mali";
	//this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutfinish1"],
			     this.worldWidth - this.tileSize*1.3,
			     this.worldHeight - this.tileSize*2.3 - 7);
	this.buffer.fillText(window.currentLanguage["tutfinish2"],
			     this.worldWidth - this.tileSize*1.3,
			     this.worldHeight - this.tileSize*2.3 + 8);
	this.buffer.drawImage(this.arrowRightImg,
			      this.worldWidth - this.tileSize-15,
			      this.worldHeight - this.tileSize*2-5,
			      this.tileSize, this.tileSize);
    }

    // Draw method for Garbage popup in tutorial.
    drawTutPopGarbage() {
	this.buffer.drawImage(this.squareImg,
			      this.tileSize*3,
			      this.worldHeight - this.tileSize*1.55,
			      this.tileSize*3.4,
			      this.tileSize);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutgarbage1"],
			     this.tileSize*4.7,
			     this.worldHeight - this.tileSize - 15);
	this.buffer.fillText(window.currentLanguage["tutgarbage2"],
			     this.tileSize*4.7,
			     this.worldHeight - this.tileSize);
	this.buffer.fillText(window.currentLanguage["tutgarbage3"],
			     this.tileSize*4.7,
			     this.worldHeight - this.tileSize + 15);
	this.buffer.drawImage(this.arrowUpImg,
			      this.tileSize*2+10,
			      this.worldHeight - this.tileSize*2,
			      this.tileSize, this.tileSize);
    }

    // Draw method for Shrimp popup in tutorial.
    drawTutPopShrimp() {
	this.buffer.drawImage(this.squareImg,
			      this.tileSize*4,
			      this.tileSize*0.85,
			      this.tileSize*2.4,
			      this.tileSize*0.9);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutshrimp1"],
			     this.worldWidth - this.tileSize*1.8,
			     this.tileSize*1.35 - 15);
	this.buffer.fillText(window.currentLanguage["tutshrimp2"],
			     this.worldWidth - this.tileSize*1.8,
			     this.tileSize*1.35);
	this.buffer.fillText(window.currentLanguage["tutshrimp3"],
			     this.worldWidth - this.tileSize*1.8,
			     this.tileSize*1.35 + 15);
	this.buffer.drawImage(this.arrowDownImg,
			      this.tileSize*3 + 10,
			      this.tileSize + 15,
			      this.tileSize, this.tileSize);
    }

    // Draw method for Dark popup in tutorial.
    drawTutPopDark() {
	const sqWidth = this.tileSize * 4;
	const sqHeight = this.tileSize * 1.3;
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth/2 - sqWidth/2,
			      this.worldHeight/2 - sqHeight/2 - 3,
			      sqWidth,
			      sqHeight);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutdark1"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 22);
	this.buffer.fillText(window.currentLanguage["tutdark2"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 7);
	this.buffer.fillText(window.currentLanguage["tutdark3"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 8);
	this.buffer.fillText(window.currentLanguage["tutdark4"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 23);
    }

    // Draw method for Let's Play popup in tutorial.
    drawTutPopPlay() {
	const sqWidth = this.tileSize * 4.5;
	const sqHeight = this.tileSize * 1.5;
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth/2 - sqWidth/2,
			      this.worldHeight/2 - sqHeight/2 - 3,
			      sqWidth,
			      sqHeight);
	this.buffer.font = "12px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutplay1"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 20);
	this.buffer.fillText(window.currentLanguage["tutplay2"],
			     this.worldWidth/2,
			     this.worldHeight/2);
	this.buffer.fillText(window.currentLanguage["tutplay3"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 20);
    }

    // Draw method for Shrimp Eaten in tutorial.
    drawTutPopShrimpEaten() {
	const sqWidth = this.tileSize * 4;
	const sqHeight = this.tileSize * 1;
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth/2 - sqWidth/2,
			      this.worldHeight/2 - sqHeight/2 - 3,
			      sqWidth,
			      sqHeight);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutshrimpeaten1"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 15);
	this.buffer.fillText(window.currentLanguage["tutshrimpeaten2"],
			     this.worldWidth/2,
			     this.worldHeight/2);
	this.buffer.fillText(window.currentLanguage["tutshrimpeaten3"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 15);
    }

    // Draw method for Lose popup in tutorial.
    drawTutPopLose() {
	const sqWidth = this.tileSize * 4;
	const sqHeight = this.tileSize * 1.5;
	this.buffer.drawImage(this.squareImg,
			      this.worldWidth/2 - sqWidth/2,
			      this.worldHeight/2 - sqHeight/2 - 3,
			      sqWidth,
			      sqHeight);
	this.buffer.font = "10px Mali";
	this.buffer.textAlign = "center";
	this.buffer.fillStyle = "white";
	this.buffer.fillText(window.currentLanguage["tutlose1"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 30);
	this.buffer.fillText(window.currentLanguage["tutlose2"],
			     this.worldWidth/2,
			     this.worldHeight/2 - 15);
	this.buffer.fillText(window.currentLanguage["tutlose3"],
			     this.worldWidth/2,
			     this.worldHeight/2);
	this.buffer.fillText(window.currentLanguage["tutlose4"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 15);
	this.buffer.fillText(window.currentLanguage["tutlose5"],
			     this.worldWidth/2,
			     this.worldHeight/2 + 30);
    }
}
