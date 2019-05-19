// The AssetsManager class takes care of all external assets, such as images
// and sounds/music.
class AssetsManager {
    // Level configurations are stored in JSON files on a certain format,
    // named as specified in the lvlUrl variable, by replacing X with an
    // integer.
    constructor() {
	this.lvlUrl = "./levelX.json";
    }

    // Loads the level configuration from the JSON file of the level specified
    // by the input num parameter, then loads the tileset image file specified
    // inside the level's JSON file. Finally, it calls the provided callback
    // method. A callback method is needed as loading JSON and image files are
    // asynchronous operations.
    loadLevel(num, callback) {
	this.getLevelData(num, (data) => {
	    this.loadTileset(data.tileset.url, (tileset) => {
		callback(data, tileset);
	    });
	});
    }

    // The JSON file data is retrieved using an XMLHttpRequest.
    getLevelData(num, callback) {
	const xhr = new XMLHttpRequest();

	xhr.open("GET", this.lvlUrl.replace("X", num));
	xhr.overrideMimeType('application/json; charset=utf8');
	xhr.addEventListener("load", function() {
	    callback(JSON.parse(xhr.responseText));
	}, {once: true});

	xhr.send();
    }

    // The tileset is loaded using and Image object and setting a handler
    // on its load event.
    loadTileset(tilesetUrl, callback) {
	const tileset = new Image();
	
	tileset.addEventListener("load", function() {
	    callback(tileset);
	}, {once: true});

	tileset.src = tilesetUrl;
    }

    // The music is loaded using an Audio object.
    loadMusic(musicUrl) {
	this.music = new Audio(musicUrl);
	this.music.loop = true;
	this.music.play();
    }
}
