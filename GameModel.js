// The GameModel class is responsible for keeping track of the game state.
// This involves the state of the game world and all objects in it, e.g.
// information about the player; position, velocity, etc.
// It is separated into multiple classes.
class GameModel {
    constructor(collisionMap, shrimpPos, startTile,
		exitTile, tilemapSize, tilesetSize, frameSets) {
	this.world = new GameWorld(collisionMap, shrimpPos, startTile,
				   exitTile, tilemapSize, tilesetSize, frameSets);
    }
    
    update() {
	this.world.update();
    }
}

// The GameWorld class keeps information about the state of the game world.
// It keeps a reference to, and is responsible for updating, the Player object.
class GameWorld {
    constructor(collisionMap, shrimpPos, startTile,
		exitTile, tilemapSize, tilesetSize, frameSets) {
	this.tilemapSize = tilemapSize;
	this.tileSize = tilesetSize.tile;
	this.width = tilemapSize.cols * this.tileSize;
	this.height = tilemapSize.rows * this.tileSize;
	this.shrimp = shrimpPos.map(sp => new GameShrimp(sp[1] * this.tileSize,
							 sp[0] * this.tileSize,
							 tilesetSize.shrimp.width,
							 tilesetSize.shrimp.height,
							 frameSets.shrimp));
	this.exit = new GameExit(exitTile.col * this.tileSize,
				 exitTile.row * this.tileSize,
				 this.tileSize, this.tileSize);
	this.player = new GamePlayer(startTile.col * this.tileSize,
				     startTile.row * this.tileSize,
				     tilesetSize.player.width,
				     tilesetSize.player.height,
				     frameSets.player);
	this.collisionHandler = new GameWorldCollisionHandler(collisionMap,
							      this.tileSize);
	this.lightRadiusMax = Math.min(this.width,
				       this.height) * 0.4;
	this.lightRadiusMin = Math.max(tilesetSize.player.width,
				       tilesetSize.player.height) * 1.3;
	this.lightRadius = this.lightRadiusMax;
	this.lightDecreaseFactor = 0.999;
	this.finished = false;
	this.gameOver = false;
    }

    decreaseLight() {
	if (this.lightRadius > this.lightRadiusMin)
	    this.lightRadius *= this.lightDecreaseFactor;
    }

    // Updates the players position, decreases its velocity by the friction
    // factor and makes sure that the player doesn't go outside the game world.
    update() {
	// Update player position.
	this.player.updatePosition();

	// If player collided with a wall, it's game over.
	let wallCollision = this.collisionHandler.handleCollision(this.player);
	if (wallCollision) {
	    console.log("Game over!");
	    this.gameOver = true;
	}
	
	// If player collided by exit tile, the player finished the level.
	let exitCollision = this.exit.collidedBy(this.player);
	if (exitCollision) {
	    console.log("Finished!");
	    this.finished = true;
	}

	// Update player animation.
	this.player.updateAnimation();
	
	// Handle potential player collision with shrimp
	// and update shrimp animation.
	for (let i = this.shrimp.length-1; i >= 0; i--) {
	    let shrimp = this.shrimp[i];
	    
	    if (shrimp.collidedBy(this.player)) {
		this.lightRadius = this.lightRadiusMax;
		this.shrimp.splice(this.shrimp.indexOf(shrimp), 1);
	    }
	    
	    shrimp.updateAnimation();
	}

	// Shrink light circle.
	this.decreaseLight();
    }
}

class GameWorldCollisionHandler {
    constructor(collisionMap, tileSize) {
	this.collisionMap = collisionMap;
	this.tileSize = tileSize;
    }

    // Handles collisions between the moving player and the world.
    // No need to check for world boundaries, we count on the tiles to take
    // care of that.
    handleCollision(obj) {
	// We recalculate the top, bottom, left and right values before
	// each call to handleCollTile to make sure they are correct,
	// since some time passes between each call.
	let left, top, right, bottom, collision = false;

	// We calculate in which tiles each of the player's hitbox's corners
	// reside, then we get each tile from the collision map and check if
	// the player is colliding with any of them.

	// Check if player's top left corner is colliding.
	top        = Math.floor(obj.top    / this.tileSize);
	left       = Math.floor(obj.left   / this.tileSize);
	collision |= this.handleCollTile(obj, top, left);

	// Check if player's top right corner is colliding.
	top        = Math.floor(obj.top    / this.tileSize);
	right      = Math.floor(obj.right  / this.tileSize);
	collision |= this.handleCollTile(obj, top, right);

	// Check if player's bottom left corner is colliding.
	bottom     = Math.floor(obj.bottom / this.tileSize);
	left       = Math.floor(obj.left   / this.tileSize);
	collision |= this.handleCollTile(obj, bottom, left);

	// Check if player's bottom right corner is colliding.
	bottom     = Math.floor(obj.bottom / this.tileSize);
	right      = Math.floor(obj.right  / this.tileSize);
	collision |= this.handleCollTile(obj, bottom, right);

	// If collision is true, we have collided somewhere.
	return collision;
    }

    // Checks the collision value in the collision map and determines which
    // walls of the specified tile is concrete and should be blocking.
    // It then handles collisions in the correct directions.
    //  0 = 0000 = No blocking walls
    //  1 = 0001 = Top
    //  2 = 0010 = Right
    //  3 = 0011 = Top, right
    //  4 = 0100 = Bottom
    //  5 = 0101 = Bottom, top
    //  6 = 0110 = Bottom, right
    //  7 = 0111 = Bottom, right, top
    //  8 = 1000 = Left
    //  9 = 1001 = Left, top
    // 10 = 1010 = Left, right
    // 11 = 1011 = Left, right, top
    // 12 = 1100 = Left, bottom
    // 13 = 1101 = Left, bottom, top
    // 14 = 1110 = Left, bottom, right
    // 15 = 1111 = Left, bottom, right, top
    handleCollTile(obj, tileRow, tileCol) {
	let tileCollValue = this.collisionMap[tileRow][tileCol];
	let tileX = tileCol * this.tileSize;
	let tileY = tileRow * this.tileSize;

	switch(tileCollValue) {
	    
	case  1: return  this.handleCollTop    (obj, tileY                  );
	case  2: return  this.handleCollRight  (obj, tileX + this.tileSize  );
	case  3: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	case  4: return  this.handleCollBottom (obj, tileY + this.tileSize  );
	case  5: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollBottom (obj, tileY + this.tileSize) );
	case  6: return (this.handleCollRight  (obj, tileX + this.tileSize) ||
			 this.handleCollBottom (obj, tileY + this.tileSize) );
	case  7: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollBottom (obj, tileY + this.tileSize) ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	case  8: return  this.handleCollLeft   (obj, tileX                  );
	case  9: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollLeft   (obj, tileX)                 );
	case 10: return (this.handleCollLeft   (obj, tileX)                 ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	case 11: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollLeft   (obj, tileX)                 ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	case 12: return (this.handleCollBottom (obj, tileY + this.tileSize) ||
			 this.handleCollLeft   (obj, tileX)                 );
	case 13: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollBottom (obj, tileY + this.tileSize) ||
			 this.handleCollLeft   (obj, tileX)                 );
	case 14: return (this.handleCollBottom (obj, tileY + this.tileSize) ||
			 this.handleCollLeft   (obj, tileX)                 ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	case 15: return (this.handleCollTop    (obj, tileY)                 ||
			 this.handleCollBottom (obj, tileY + this.tileSize) ||
			 this.handleCollLeft   (obj, tileX)                 ||
			 this.handleCollRight  (obj, tileX + this.tileSize) );
	default: return  false; // Fail-safe, should never happen.
	    
	}
    }

    // Handles when player collides with a tile's left wall.
    // When resetting the player's position to be entirely to the left of the
    // tile, we subtract a small amount from x-value of the tile's left wall,
    // otherwise the collision handler would detect this is a collision since
    // the player's right value is equal to the tile's left value.
    handleCollLeft(obj, tileLeft) {
	if (obj.right > tileLeft && obj.rightOld <= tileLeft) {
	    obj.right = tileLeft - 0.01;
	    obj.velX = 0;
	    return true;
	}
	return false;
    }

    // Handles when player collides with a tile's top wall.
    // We subtract 0.01 from tileTop for the same reason as described in the
    // last case above.
    handleCollTop(obj, tileTop) {
	if (obj.bottom > tileTop && obj.bottomOld <= tileTop) {
	    obj.bottom = tileTop - 0.01;
	    obj.velY = 0;
	    return true;
	}
	return false;
    }

    // Handles when player collides with a tile's right wall.
    handleCollRight(obj, tileRight) {
	if (obj.left < tileRight && obj.leftOld >= tileRight) {
	    obj.left = tileRight;
	    obj.velX = 0;
	    return true;
	}
	return false;
    }

    // Handles when player collides with a tile's bottom wall.
    handleCollBottom(obj, tileBottom) {
	if (obj.top < tileBottom && obj.topOld >= tileBottom) {
	    obj.top = tileBottom;
	    obj.velY = 0;
	    return true;
	}
	return false;
    }
}

// Base class for all objects in the game world.
class GameObject {
    constructor(x, y, width, height) {
	this._x = x;
	this._y = y;
	this._width = width;
	this._height = height;
    }
    
    get width()   { return this._width;  }
    get height()  { return this._height; }

    get x()       { return this._x; }
    get y()       { return this._y; }
    set x(xNew)   { this._x = xNew; }
    set y(yNew)   { this._y = yNew; }

    get xCenter() { return this._x + this._width  * 0.5; }
    get yCenter() { return this._y + this._height * 0.5; }
    
    get left()    { return this._x; }
    get top()     { return this._y; }
    get right()   { return this._x + this._width;  }
    get bottom()  { return this._y + this._height; }
    
    set left(x)   { this._x = x; }
    set top(y)    { this._y = y; }
    set right(x)  { this._x = x - this._width;  }
    set bottom(y) { this._y = y - this._height; }

    // Checks if obj is colliding with this object.
    collidedBy(obj) {
	if (obj.left   > this.right  ||
            obj.top    > this.bottom ||
            obj.right  < this.left   ||
            obj.bottom < this.top)
	    return false;
	
	return true;
    }
}

class GameFrame {
    constructor(x, y, width, height, offsetX=0, offsetY=0) {
	this.x       = x;
	this.y       = y;
	this.width   = width;
	this.height  = height;
	this.offsetX = offsetX;
	this.offsetY = offsetY;
    }
}

class GameAnimator {
    constructor(frameSet, delay, mode="loop") {
	this.frameSet = frameSet;
	this.frameIndex = 0;
	this.frame = frameSet[0];
	this.delay = delay;
	this.mode = mode;
	this.count = 0;
    }

    animate() {
	if (this.mode == "loop")
	    this.loop();
    }

    changeFrameSet(frameSet, mode, delay=10, frameIndex=0) {
	// Don't need this?
	if (this.frameSet == frameSet) return;

	this.frameSet = frameSet;
	this.frameIndex = frameIndex;
	this.frame = frameSet[frameIndex];
	this.delay = delay;
	this.mode = mode;
	this.count = 0;
    }

    loop() {
	this.count++;

	while (this.count > this.delay) {
	    this.count -= this.delay;
	    this.frameIndex = (this.frameIndex + 1) % this.frameSet.length;
	    this.frame = this.frameSet[this.frameIndex];
	}
    }
}

// Base class for all moving objects in the game world.
class GameMovingObject extends GameObject {
    constructor(x, y, width, height, velMax=15, friction=0.9) {
	super(x, y, width, height);
	// Need to constantly keep track of the objects x and y values for the
	// previous frame to know which direection the player came from upon
	// collision.
	this._xOld = x;
	this._yOld = y;
	this._velX = 0;
	this._velY = 0;
	// Max velocity ensures that player won't be
	// able to glitch through walls.
	this._velMax = velMax;
	// The friction deteremines the velocity decay
	// of the player when no arrow key is pressed.
	this._friction = friction;
    }

    get velMax()     { return this._velMax; }
    get friction()   { return this._friction; }

    get velX()       { return this._velX; }
    get velY()       { return this._velY; }
    set velX(velX)   { this._velX = velX; }
    set velY(velY)   { this._velY = velY; }

    get xOld()       { return this._xOld; }
    get yOld()       { return this._yOld; }
    set xOld(x)      { this._xOld = x; }
    set yOld(y)      { this._yOld = y; }
    
    get leftOld()    { return this._xOld; }
    get topOld()     { return this._yOld; }
    get rightOld()   { return this._xOld + this.width; }
    get bottomOld()  { return this._yOld + this.height; }
    
    set leftOld(x)   { this._xOld = x; }
    set topOld(y)    { this._yOld = y; }
    set rightOld(x)  { this._xOld = x - this._width; }
    set bottomOld(y) { this._yOld = y - this._height; }

    isMoving() {
	return (this.velX < -0.1 ||
		this.velX >  0.1 ||
		this.velY < -0.1 ||
		this.velY >  0.1);
    }
}

// The GamePlayer class keeps information about the player;
// position, velocity, etc.
class GamePlayer extends GameMovingObject {
    constructor(startX, startY, width, height, frameSets) {
	super(startX, startY, width, height);
	this.dirX = 1; // Initially facing right
	
	this.frameSets = {
	    "idle-left" : frameSets["idle-left" ].map(f => new GameFrame(...f)),
	    "swim-left" : frameSets["swim-left" ].map(f => new GameFrame(...f)),
	    "idle-right": frameSets["idle-right"].map(f => new GameFrame(...f)),
	    "swim-right": frameSets["swim-right"].map(f => new GameFrame(...f))
	};

	this.animator = new GameAnimator(this.frameSets["idle-right"], 10);
    }

    // Updates the player's position using its velocity.
    updatePosition() {
	this.xOld = this.x;
	this.yOld = this.y;
	
	this.velX *= this.friction;
	this.velY *= this.friction;

	if (Math.abs(this.velX) > this.velMax)
	    this.velX = this.velMax * Math.sign(this.velX);
	
	if (Math.abs(this.velY) > this.velMax)
	    this.velY = this.velMax * Math.sign(this.velY);
	
	this.x += this.velX;
	this.y += this.velY;
    }

    updateAnimation() {
	if (this.isMoving()) {
	    if (this.dirX == -1)
		this.animator.changeFrameSet(this.frameSets["swim-left"],
					     "loop", 5);
	    else
		this.animator.changeFrameSet(this.frameSets["swim-right"],
					     "loop", 5);
	} else {
	    if (this.dirX == -1)
		this.animator.changeFrameSet(this.frameSets["idle-left"],
					     "pause");
	    else
		this.animator.changeFrameSet(this.frameSets["idle-right"],
					     "pause");
	}
	
	this.animator.animate();
    }
    
    // Move functions will be called as the GameController detects user input
    // on the arrow keys, and the velocity will be increased/decreased
    // accordingly depending on the direction.
    moveLeft()  { this.velX -= 0.55; this.dirX = -1; }
    moveUp()    { this.velY -= 0.55;                 }
    moveRight() { this.velX += 0.55; this.dirX =  1; }
    moveDown()  { this.velY += 0.55;                 }
}

class GameShrimp extends GameObject {
    constructor(x, y, width, height, frameSets) {
	super(x, y, width, height);

	this.frameSets = {
	    "squirm": frameSets["squirm"].map(f => new GameFrame(...f))
	};
	
	this.animator = new GameAnimator(this.frameSets["squirm"], 15);
    }

    // Don't need updatePosition() function since it won't move.

    updateAnimation() {
	this.animator.animate();
    }
}

class GameExit extends GameObject {
    constructor(x, y, width, height) {
	super(x, y, width, height);
    }
}
