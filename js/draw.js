let spritesheet;
let spritedata;

let animation = [];
let fish;


function preload() {
  spritedata = loadJSON('js/fish-right.json');
  spritesheet = loadImage('images/sprite-fish-right.png');
}

function setup() {
  createCanvas(640, 480);
  let frames = spritedata.frames;
  for (let i = 0; i < frames.length; i++) {
    let pos = frames[i].position;
    let img = spritesheet.get(pos.x, pos.y, pos.w, pos.h);
    animation.push(img);
  }

  fish = new Sprite(animation, 0, 75, 0.1, 0.1);

}

function draw() {
  background(93, 173, 226);

  fish.show();
  fish.animate();
  fish.update();

}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    fish.dir(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    fish.dir(0, 1);
  } else if (keyCode === RIGHT_ARROW) {
    fish.dir(1, 0);
  } else if (keyCode === LEFT_ARROW) {
    fish.dir(-1, 0);
  }
}
