var Game = {
	_display: null,
	getDisplay: function() { return this._display; },
	
	_currentScreen: null,
	switchScreen: function(screen) {
		// If we already had a screen, notify it that we exited
		if(this._currentScreen !== null) {
			this._currentScreen.exit();
		}
		
		// Clear the display
		this.getDisplay.clear();
		
		// Update our current screen, notify it we entered
		// then render it
		this._currentScreen = screen;
		if (!this._currentScreen !== null) {
			this._currentScreen.enter();
			this._currentScreen.render(this._display);
		}
	},
	
	player: null,
	engine: null,
	map: {},
	
	init: function(tilesQ) {
		var dispOptions = { width:80, height: 24 };
		/*Set up the tileset, if any
		if (tilesQ != null){
			//display parameters - tiles
			dispOptions.layout = "tile";
			dispOptions.bg = "transparent";
			dispOptions.tileWidth = 64;
			dispOptions.tileHeight = 64;
			dispOptions.tileSet = tileSet;
			dispOptions.tileMap = {
				"@": [0, 0],
				".": [64, 0]
				};
			}

			var tileSet = document.createElement("img");
			tileSet.src = "TestTiles.png";
		}
		else{
			
			//display parameters - console
			dispOptions.fontSize = 28;
		}
		*/
		//Create and append the display
		this._display = new ROT.Display(dispOptions);
		document.body.appendChild(this._display.getContainer());
		
		var game = this;
		var bindEventToScreen = function(event) {
			window.addEventListener(event, function(e) {
				// When an event is received, send it to the screen
				// if there is one
				if (game._currentScreen !== null) {
					// Send the event type and data to the screen
					game._currentScreen.handleInput(event, e);
				}
			});
		}
		// Bind Keyboard input events
		bindEventToScreen('keydown');
		bindEventToScreen('keyup');
		bindEventToScreen('keypress');
		
		
		
		
		//generate the map
		this._generateMap();
		
		//create a simple ROT.js scheduler, and add the player (and others) to it
		var scheduler = new ROT.Scheduler.Simple();
		scheduler.add(this.player, true);
		
		//create the engine using the simple scheduler
		this.engine = new ROT.Engine(scheduler);
		this.engine.start();
		
	},
		
	_generateMap: function(){
		var digger = new ROT.Map.Digger();
		var freeCells = [];		
		
		var digCallback = function(x, y, value) {
			if (value) { return; }	/* do not store walls*/
			
			var key = x+", "+y;
			this.map[key] = ".";
			freeCells.push(key);
		}
		digger.create(digCallback.bind(this));
		
		this._createPlayer(freeCells);
	},
	
	_drawWholeMap: function(){
		for (var key in this.map) {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			this.display.draw(x, y, this.map[key]);
		}
	},
	
	_createPlayer: function(freeCells) {
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice (index, 1)[0];
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this.player = new Player(x, y);
	}
}

var Player = function(x, y){
	this._x = x;
	this._y = y;
	this._draw();
}


Player.prototype._draw = function() {
	Game.getDisplay.draw(this._x, this._y, "@", "#ff0");
}
Player.prototype.act = function() {
	Game.engine.lock();
	/* Wait for input from user */
	window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
	/* Process user input */
	
	/* Map numpad to directions with ROT.DIRS[8]
		ROT.DIRS[4] and [6] also exist

	
	  7   0   1
	    \ | / 
	  6 -   - 2
	    / | \
	  5   4   3  
	
	*/
	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;
	
	var code = e.keyCode;
	
	if(!(code in keyMap)) { return; }	// Bail if not a numpad key
	
	var diff = ROT.DIRS[8][keyMap[code]];
	var newX = this._x + diff[0];
	var newY = this._y + diff[1];
	
	var newKey = newX + ", " + newY;
	if  (!(newKey in Game.map)) { return; }	//Can't move there (because there's nothing there in the map)
	
	Game.display.draw(this._x, this._y, Game.map[this._x+", "+this._y]);
	this._x = newX;
	this._y = newY;
	this._draw();
	window.removeEventListener("keydown", this);
	Game.engine.unlock();
}
	
window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();
        // Add the container to our HTML page
        document.body.appendChild(Game.getDisplay().getContainer());
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen);
    }
}