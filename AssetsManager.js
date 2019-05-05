// The AssetsManager class takes care of all external assets, such as images
// and sounds/music.
class AssetsManager {
    constructor() {
	this.lvlUrl = "./levelX.json";
    }

    loadLevel(num, callback) {
	this.getLevelData(num, (data) => {
	    this.loadTileset(data.tileset.url, (tileset) => {
		callback(data, tileset);
	    });
	});
    }

    getLevelData(num, callback) {
	const xhr = new XMLHttpRequest();

	xhr.open("GET", this.lvlUrl.replace("X", num));
	xhr.overrideMimeType('application/json; charset=utf8');
	xhr.addEventListener("load", function() {
	    callback(JSON.parse(xhr.responseText));
	}, {once: true});

	xhr.send();
    }

    loadTileset(tilesetUrl, callback) {
	const tileset = new Image();
	
	tileset.addEventListener("load", function() {
	    callback(tileset);
	}, {once: true});

	tileset.src = tilesetUrl;
    }

    loadMusic(musicUrl) {
	this.music = new Audio(musicUrl);
	this.music.loop = true;
	this.music.play();
    }
}
