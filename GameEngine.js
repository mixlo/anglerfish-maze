// The GameEngine is responsible for keeping the game running.
// It updates the model and renders the view at a rate of 60 times per second.
// It accumulates time to be able to only update/render at certain time steps.
// This also enables the engine to make sure that no updates are lost, in case
// the rendering takes longer than a time step.
class GameEngine {
    // updatesPerSec determines how many times per second the engine will 
    // check if any arrow keys are pressed and update the player's position
    // accordingly. Higher updatesPerSec == faster game, but slower devices
    // might not be able to keep up with the speed if too high.
    constructor(update, render, updatesPerSec=30) {
	this.update = update;
	this.render = render;
	this.timeStep = 1000/updatesPerSec;
	this.accTime = 0;
	this.prevTime = undefined;
	this.afr = undefined;
	this.updated = false;
    }

    // Starts the engine, entering the run() loop, keeping track of the last
    // animation frame request to be able to stop the loop, if desired.
    start() {
	this.prevTime = window.performance.now();
	this.accTime = this.timeStep;
	this.afr = window.requestAnimationFrame((ts) => this.run(ts));
    }

    // Stops the run() loop by cancelling the current animation frame request.
    stop() {
	window.cancelAnimationFrame(this.afr);
    }

    // The fixed time step game loop.
    // Performs animation frame requests in a loop, but only does anything
    // when the accumulated time has exceeded at least one time step.
    run(timeStamp) {
	// Performing the animation frame request in the beginning of the loop 
	// can be better in case the rendering takes long, then a new request
	// will already be queued upon finishing. Though, it shouldn't make
	// much difference if we put it in the end as well.
	this.afr = window.requestAnimationFrame((ts) => this.run(ts));
	this.accTime += timeStamp - this.prevTime;
	this.prevTime = timeStamp;

	// If the device on which the game is rendered is very slow, a lot of
	// updates may be accumulated which can cause a crash. If this is the
	// case, this makes sure to skip a few (3) updates instead of crashing
	// the device.
	if (this.accTime >= this.timeStep * 3) {
	    this.accTime = this.timeStep;
	}

	// Check how many time steps fit in the accumulated time and perform
	// that many updates to the model.
	while (this.accTime >= this.timeStep) {
	    this.accTime -= this.timeStep;
	    this.update();
	    this.updated = true;
	}

	// We only render the game if an update to the model was actually
	// performed.
	if (this.updated) {
	    this.render();
	    this.updated = false;
	}
    }
}
