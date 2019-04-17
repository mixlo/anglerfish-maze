// The GameModel class is responsible for keeping track of the game state.
// This involves the state of the game world and all objects in it, e.g.
// information about the player; position, velocity, etc.
// It is separated into multiple classes.
class GameModel {
    constructor() {
	this.world = new GameWorld();
    }
    
    update() {
	this.world.update();
    }
}

// The GameWorld class keeps information about the state of the game world.
// It keeps a reference to, and is responsible for updating, the Player object.
class GameWorld {
    constructor() {
	this.width = 640;
	this.height = 480;
	this.bgColor = "rgba(40, 48, 56, 0.25)";
	// The friction deteremines the velocity decay of the player when no
	// arrow key is pressed.
	this.friction = 0.9;
	this.player = new GamePlayer();
    }

    // Updates the players position, decreases its velocity by the friction
    // factor and makes sure that the player doesn't go outside the game world.
    update() {
	this.player.update();
	this.player.velX *= this.friction;
	this.player.velY *= this.friction;
	this.handleCollision(this.player);
    }

    // Handles object collision with game world limits.
    handleCollision(obj) {
	if (obj.x < 0) {
	    obj.x = 0;
	    obj.velX = 0;
	} else if (obj.x + obj.width > this.width) {
	    obj.x = this.width - obj.width;
	    obj.velX = 0;
	}
	
	if (obj.y < 0) {
	    obj.y = 0;
	    obj.velY = 0;
	} else if (obj.y + obj.height > this.height) {
	    obj.y = this.height - obj.height;
	    obj.velY = 0;
	}
    }
}

// The GamePlayer class keeps information about the player;
// position, velocity, etc.
class GamePlayer {
    constructor() {
	this.color = "#ff0000";
	this.width = 16;
	this.height = 16;
	this.x = 100;
	this.y = 50;
	this.velX = 0;
	this.velY = 0;
    }

    // Updates the player's position using its velocity.
    update() {
	this.x += this.velX;
	this.y += this.velY;
    }

    // Move functions will be called as the GameController detects user input
    // on the arrow keys, and the velocity will be increased/decreased
    // accordingly depending on the direction.
    moveLeft()  { this.velX -= 0.5; }
    moveUp()    { this.velY -= 0.5; }
    moveRight() { this.velX += 0.5; }
    moveDown()  { this.velY += 0.5; }
}
