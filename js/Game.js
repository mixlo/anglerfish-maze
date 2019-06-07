// The Game class is the main class for communication between each component.
class Game {
    constructor(isTutorial=false) {
        // Arrow functions are used to preserve context ("this").
        // handleFunc is run in the engine after each frame to check whether
        // the player has won or lost, and in such a case, show the correct
        // dialog. The handleFunc for the tutorial is a bit different, since
        // we don't want to abort if we hit a wall, and show an extra popup
        // in case the player ate a shrimp.
        const handleFunc = isTutorial
              ? () => this.handleEventsTut()
              : () => this.handleEvents();
        this.assManager = new AssetsManager();
        this.engine = new GameEngine(() => this.update(),
                                     () => this.render(),
                                     handleFunc);
        // The controller tracks arrow key input from the user.
        this.controller = undefined;
        // The model keeps track of the entire game state.
        this.model = undefined;
        // The view is responsible for rendering the model for each frame.
        this.view = undefined;

        // Keeps track of whether the Pause dialog is active. Used to check
        // whether engine should be started or stopped and if tutorial should
        // respond to Enter pressed input.
        this.escModalActive = false;
        // Keeps track of whether the Level Finished dialog is active. Used to
        // control if the game should respond to Escape or Enter pressed input.
        this.endModalActive = false;
        //Keeps track of whether a popup in the tutorial mode is active. Used
        // to control whether the engine should be turned of and the game
        // should respond to Enter press input.
        this.tutPopupActive = false;

        // Used to enable/disable the rendering of the mask of darkness around
        // the player.
        this.disableMask = false;
        // Used for Quit button event handlers in all dialogs.
        this.startPageUrl = "Welcome_Page.html";
        // Determines when the final Level Finished dialog should appear
        // (different success message and music)
        this.finalLevel = 5;
        // Used to determine which JSON file to load. If no valid value found,
        // default to Level 1.
        this.currentLevel = parseInt(localStorage.getItem("level"));
        if (isNaN(this.currentLevel))
            this.currentLevel = 1;

        // Keeps track of whether we are in tutorial mode. Used at different
        // places, when determining how to handle events that should be
        // treated differently in tutorial mode.
        this.isTutorial = isTutorial;
    }

    // Starts the game engine, game will update state and render 30 times/s.
    // The level configurations are stored in JSON files and will be read by
    // the AssetsManager object.
    start() {
        this.assManager.loadLevel(this.currentLevel, (data, tileset) => {
            this.controller = new GameController();
            this.model = new GameModel(data.tilemap.collision,
                                       data.tilemap.shrimpPos,
                                       data.tilemap.startTile,
                                       data.tilemap.exitTile,
                                       data.tilemap.size,
                                       data.tileset.size,
                                       data.tileset.frameSets);
            this.view = new GameView(this.model.world.width,
                                     this.model.world.height,
                                     tileset,
                                     data.tilemap.graphical,
                                     data.tilemap.size,
                                     data.tileset.size.tile);
            
            // Arrow function to preserve context ("this")
            const keyChange = (e) => this.controller.keyChange(e.type,
                                                               e.keyCode);
            // Make sure game respondes to arrow
            // keys and resizing of the window.
            window.addEventListener("keydown", keyChange);
            window.addEventListener("keyup", keyChange);
            window.addEventListener("resize", () => this.resize());

            // Set up the buttons etc. of all modal
            // dialogs that can occur during the level.
            this.setUpPauseModal();
            this.setUpFinalModal();

            // These modals are not used during the tutorial.
            if (!this.isTutorial) {
                this.setUpLoseModal();
                this.setUpFinishModal();
            }
            
            // Begin by making sure that game is scaled to the window
            // correctly (this will also trigger an initial rendering), load
            // the background music for the level and start the engine, which
            // will update the model and render the view 30 times per second.
            this.resize();
            this.assManager.loadMusic(data.music.url, data.music.offset);

            // If we are in tutorial, we don't start the engine right off,
            // and we begin by having the light mask disabled. Image smoothing
            // is also enabled to make the text in the popups smoother.
            if (this.isTutorial) {
                this.disableMask = true;
                this.view.useImageSmoothing(true);
                this.renderTut();
            } else {
                this.engine.start();
            }
        });
    }

    // Checks if arrow keys are pressed or not and adds velocity to directions,
    // then updates the model; e.g. the player's position.
    update() {
        if (this.controller.left.active)  this.model.world.player.moveLeft();
        if (this.controller.up.active)    this.model.world.player.moveUp();
        if (this.controller.right.active) this.model.world.player.moveRight();
        if (this.controller.down.active)  this.model.world.player.moveDown();
        this.model.update();
    }

    // Renders the world; filling the background, rendering the player at its
    // position specified in the model.
    render() {
        // Draw buffer canvas.
        this.drawBuffer();
        // Render buffer canvas onto real canvas.
        this.view.render();
    }

    // Resizes and renders the game view when
    // the browser window size is adjusted.
    resize() {
        const domWidth = document.documentElement.clientWidth;
        const domHeight = document.documentElement.clientHeight;
        this.view.resize(domWidth, domHeight);
        this.view.render();
    }

    // Draws everything onto the buffer canvas.
    drawBuffer() {
        // Draw tilemap onto buffer canvas
        this.view.drawMap();

        // Draw player onto buffer canvas
        let player = this.model.world.player;
        let playerFrame = player.animator.frame;
        this.view.drawObject(player, playerFrame);

        // Draw shrimp onto buffer canvas
        for (let shrimp of this.model.world.shrimp) {
            let shrimpFrame = shrimp.animator.frame;
            this.view.drawObject(shrimp, shrimpFrame);
        }
        
        // Draw light mask onto buffer canvas
        if (!this.disableMask)
            this.view.drawLightMask(this.model.world.player.xCenter,
                                    this.model.world.player.yCenter,
                                    this.model.world.lightRadius);
    }
    
    // Handles whatever terminated the level (finish/fail) by halting the
    // engine, stopping the level's background music, showing the appropriate
    // modal dialog and playing the appropriate music (success/fail).
    handleEvents() {
        let modal, musicFunc;
        
        if (this.model.world.finished) {
            if (this.currentLevel == this.finalLevel) {
                modal = document.getElementById("modalFinal");
                musicFunc = this.assManager.playFinalMusic;
            } else {
                modal = document.getElementById("modalFinish");
                musicFunc = this.assManager.playFinishMusic;
            }
        } else if (this.model.world.gameOver) {
            modal = document.getElementById("modalLose");
            musicFunc = this.assManager.playFailMusic;
        } else {
            return;
        }

        this.engine.stop();
        this.assManager.stopMusic();
        modal.classList.toggle("show-modal");
        musicFunc();
        this.endModalActive = true;
    }

    // Handles events in the tutorial. If the player finished the tutorial,
    // show the Level Finished dialog, turn of engine, play music, etc.
    // If the player ate a shrimp or hit a wall, show the appropriate popup
    // and handle the event appropriately.
    handleEventsTut() {
        if (this.model.world.finished) {
            const modal = document.getElementById("modalFinal");
            this.engine.stop();
            this.assManager.stopMusic();
            modal.classList.toggle("show-modal");
            this.assManager.playFinishMusic();
            this.endModalActive = true;
        } else if (this.model.world.gameOver &&
                   !this.tutLoseDone) {
            this.engine.stop();
            this.renderTutPopFunc = this.tutPopLose;
            this.renderTutPopup();
            this.tutPopupActive = true;
            this.tutLoseDone = true;
            // Disable collisions after first collision in tutorial mode.
            // We want to be forgiving during the tutorial.
            this.model.world.disableCollisions = true;
        } else if (this.model.world.shrimpEaten &&
                   !this.tutShrimpEatenDone) {
            this.engine.stop();
            this.renderTutPopFunc = this.tutPopShrimpEaten;
            this.renderTutPopup();
            this.tutPopupActive = true;
            // Keeps track of that we have showed the Shrimp Eaten popup,
            // so that it won't be shown again, if there were to be more shrimp.
            this.tutShrimpEatenDone = true;
        }
    }

    // Sets up the actions of the buttons in the 'pause' modal dialog, which
    // appears when the player presses the Escape button. The 'pause' dialog
    // allows for muting/unmuting all sounds and music, quitting to main menu
    // or resuming the game play.
    setUpPauseModal() {
        window.addEventListener("keydown", (e) => this.checkEscPressed(e));
        
        const btnResume = document.getElementById("pauseBtnResume");
        const btnToggleMute = document.getElementById("pauseBtnToggleMute");
        const btnQuit = document.getElementById("pauseBtnQuit");

        btnResume.addEventListener("click", () => {
            var modal = document.getElementById("modalPause");
            modal.classList.toggle("show-modal");
            this.escModalActive = !this.escModalActive;
            if (!this.tutPopupActive)
                this.engine.start();
        });

        btnToggleMute.addEventListener("click", () => {
            window.audioManager.toggleMuteAll();
        });

        btnQuit.addEventListener("click", () => {
            location.replace(this.startPageUrl);
        });
    }

    // Sets up the actions of the buttons in the 'finish' modal dialog, which
    // appears when the player reaches the exit of the level. It will allow
    // the player to either continue to the next level or quit to the main menu.
    setUpFinishModal() {
        const btnNext = document.getElementById("finishBtnNext");
        const btnQuit = document.getElementById("finishBtnQuit");

        btnNext.addEventListener("click", () => {
            localStorage.setItem("level", this.currentLevel + 1);
            location.reload();
        });

        btnQuit.addEventListener("click", () => {
            location.replace(this.startPageUrl);
        });
    }

    // Sets up the actions of the buttons in the 'fail' modal dialog, which
    // appears when the player collides with a wall. It will allow the player
    // to either try the level again from the start, or quit to the main menu. 
    setUpLoseModal() {
        const btnAgain = document.getElementById("loseBtnAgain");
        const btnQuit = document.getElementById("loseBtnQuit");

        btnAgain.addEventListener("click", () => {
            location.reload();
        });

        btnQuit.addEventListener("click", () => {
            location.replace(this.startPageUrl);
        });
    }

    // Sets up the actions of the buttons in the 'final' modal dialog, which
    // appears instead of the 'finish' modal dialog when the player reaches
    // the end of the final level. It will just congratulate the player on
    // finishing all levels and then allow for them to return to main menu.
    setUpFinalModal() {
        const btnQuit = document.getElementById("finalBtnQuit");

        btnQuit.addEventListener("click", () => {
            location.replace(this.startPageUrl);
        });
    }
    
    // Shows pause menu if ESC key was pressed.
    checkEscPressed(event) {
        if (event.keyCode == 27 && !this.endModalActive) {
            const modal = document.getElementById("modalPause");
            modal.classList.toggle("show-modal");
            this.escModalActive = !this.escModalActive;

            if (this.escModalActive) {
                this.engine.stop();
            } else if (!this.tutPopupActive) {
                // We don't want to start directly in case there is a tutorial
                // popup active.
                this.engine.start();
            }
        }
    }



    // Initializes the rendering of the first tutorial popups.
    renderTut() {
        this.currentTutPop = 0;
        this.tutPopupActive = true;

        // Popups that should be shown directly during the start of the
        // tutorial, before the actual game play has begun.
        this.tutPopups = [
            this.tutPopWelcome,
            this.tutPopFish,
            this.tutPopFinish,
            this.tutPopGarbage,
            this.tutPopShrimp,
            this.tutPopDark,
            this.tutPopPlay
        ];

        // Start listening for Enter press inputs to close tutorial popups.
        window.addEventListener("keydown",
                                (e) => this.checkTutEnterPressed(e));

        // Start rendering the initial popups.
        this.handleTutEnterPressed();
    }

    // Checks if the Enter key was pressed, and handles the event, but only if 
    // a tutorial popup is active and none of the Finish/Pause dialogs are
    // active.
    checkTutEnterPressed(event) {
        if (event.keyCode == 13 &&
            this.tutPopupActive &&
            !this.escModalActive &&
            !this.endModalActive) {
            this.handleTutEnterPressed();
        }
    }

    // Called when the player closes a tutorial popup by pressing Enter.
    // If we are not done with the initial popups, continue showing the next
    // one. Otherwise, disable image smoothing and start the engine, since we
    // now are in game play.
    handleTutEnterPressed() {
        if (this.currentTutPop >= this.tutPopups.length) {
            this.tutPopupActive = false;
            this.view.useImageSmoothing(false);
            this.engine.start();
        } else {
            this.renderTutPopFunc = this.tutPopups[this.currentTutPop];
            this.renderTutPopup();
            this.currentTutPop++;
        }
    }

    // Renders a tutorial mode popup. First we run the currently set popup
    // rendering function with the runPreSetup argument set to true. This is
    // used to for example perform some preparations before the actual
    // rendering. Then we request an animation frame where we enable image
    // smoothing to make the text in the popup smoother, draw the buffer as
    // usual, and then we draw the popup onto the buffer. Finally, we render
    // the buffer onto the real canvas.
    renderTutPopup() {
        this.renderTutPopFunc(true);
        window.requestAnimationFrame(() => {
            this.view.useImageSmoothing(true);
            this.drawBuffer();
            this.renderTutPopFunc(false);
            this.view.render();
        });
    }

    // The rendering functions for each popup.
    tutPopWelcome()     { this.view.drawTutPopWelcome();     }
    tutPopFish()        { this.view.drawTutPopFish();        }
    tutPopGarbage()     { this.view.drawTutPopGarbage();     }
    tutPopShrimp()      { this.view.drawTutPopShrimp();      }
    tutPopFinish()      { this.view.drawTutPopFinish();      }
    tutPopPlay()        { this.view.drawTutPopPlay();        }
    tutPopShrimpEaten() { this.view.drawTutPopShrimpEaten(); }
    tutPopLose()        { this.view.drawTutPopLose();        }

    // In the Dark popup we want to enable the light mask before showing the 
    // actual popup.
    tutPopDark(runPreSetup) {
        if (runPreSetup) {
            this.disableMask = false;
        } else {
            this.view.drawTutPopDark();
        }
    }
}
