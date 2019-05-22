// The GameController class i responsible for detecting user input.
class GameController {
    constructor() {
	this.left = {active: false};
	this.up = {active: false};
	this.right = {active: false};
	this.down = {active: false};
    }

    keyChange(kType, kCode) {
	// Arrow key codes: 37=left, 38=up, 39=right, 40=down
	// If the detected key event didn't concern the arrow keys, ignore it.
	if (kCode < 37 || kCode > 40)
	    return;

	// Set the "active" state of the detected key to true if it was a
	// "keydown" event, otherwise false.
	[this.left,
	 this.up,
	 this.right,
	 this.down][kCode-37].active = kType == "keydown";
    }
}
