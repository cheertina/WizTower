Game.Screen = {};

/* Skeleton
{
	enter: function(){},
	exit: function(){},
	render: function(){},
	handleInput: function (){}
}
*/

// Define our initial start screen
Game.Screen.startScreen = {
	enter: function(){ console.log("Entered the start screen."); },
	exit: function(){ console.log("Exited the start screen"); },
	render: function(display){
		// Render our prompt to the screen
		display.drawText(1,1, "%c{yellow}Javascript Roguelike: Wizard's Tower");
		display.drawText(1,2, "Press [Enter] to start!");
	},
	handleInput: function (inputType, inputData){
		// When [Enter] is pressed, go to the play screen
		if (inputType === 'keydown') {
			if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.playScreen);
			}
		}
	}
}

// Define our playing screen
Game.Screen.playScreen = {
	_map: null,
    _player: null,
	
	
	// For now we create the map on entering the level - eventually we'll make them persist
	// when you leave, so you can come back to the same level
	
	enter: function() {
		console.log( "Entered playScreen.")
		
		var map = [];
		let width  = 80;
		let height = 24;
		let depth = 6;
		// Use our Builder to make the map
		var tiles = new Game.Builder(width, height, depth).getTiles();
		
		// Create map from the tiles and our player object
		this._player = new Game.Entity(Game.Templates.Player);
		this._map = new Game.Map(tiles, this._player)
		//this._map = new Game.Map(map, this._player);  <--- old version
		
		// Start the map's engine
		this._map.getEngine().start();
		
		
	},//enter()
    
	exit: function() { console.log("Exited play screen."); },
	
    render: function(display) {
		let screenWidth = Game.getScreenWidth();
		let screenHeight = Game.getScreenHeight();

		
		// make sure our viewport doesn't try to scroll off the map to the left
		// and don't scroll so far to the right that you don't have a full screen to display
		let topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		
		let topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

		
		// Iterate through all visible map cells
        for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
				//Fetch the glyph for the tile and render it to the screen
				// at the offest position
				let tile = this._map.getTile(x, y, this._player.getZ());
				display.draw(
					x - topLeftX,
					y - topLeftY,
					tile.getChar(),
					tile.getForeground(),
					tile.getBackground()
				);
			}
		}
		// Render the entities
		var entities = this._map.getEntities();
		for (let i = 0; i < entities.length; i++){
			let entity = entities[i];
			//only render it if it actually fits in the viewport
			if (entity.getX() >= topLeftX &&
				entity.getY() >= topLeftY &&
                entity.getX() < topLeftX + screenWidth &&
                entity.getY() < topLeftY + screenHeight &&
				entity.getZ() == this._player.getZ()) {
                display.draw(
                    entity.getX() - topLeftX, 
                    entity.getY() - topLeftY,
                    entity.getChar(), 
                    entity.getForeground(), 
                    entity.getBackground()
                );
            }
		}
		// Get and render messages in the player's queue
		let messages = this._player.getMessages();
		var messageY = 0;
		for (let i = 0; i < messages.length; i++ ) {
			messageY += display.drawText(0, messageY, '%c{white}%b{black}' + messages[i]);
		}
		
		// Show hp
		let stats = '%c{white}%b{black}';
		stats += vsprintf('HP: %d/%d   (%d, %d)',
			[this._player.getHp(), this._player.getMaxHp(),
			this._player.getX(), this._player.getY()]);
		display.drawText(0, screenHeight, stats);
		
		
    }, //render()
	
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            } else {
				// Movement
				switch(inputData.keyCode){
					case ROT.VK_NUMPAD1: this.move(-1,  1, 0); break;
					case ROT.VK_NUMPAD2: this.move( 0,  1, 0); break;
					case ROT.VK_NUMPAD3: this.move( 1,  1, 0); break;
					case ROT.VK_NUMPAD4: this.move(-1,  0, 0); break;
					case ROT.VK_NUMPAD5: /*this.move( 0,  0, 0);*/ break; 	// nop; moving on top of self causes attacking self
					case ROT.VK_NUMPAD6: this.move( 1,  0, 0); break;
					case ROT.VK_NUMPAD7: this.move(-1, -1, 0); break;
					case ROT.VK_NUMPAD8: this.move( 0, -1, 0); break;
					case ROT.VK_NUMPAD9: this.move( 1, -1, 0); break;				
					default: return;
				}
					this._map.getEngine().unlock();
			}
        } else if (inputType == 'keypress') {
			let keyChar = String.fromCharCode(inputData.charCode);
			if (keyChar === '>') {
				this.move(0, 0, 1);
			} else if (keyChar === '<'){
				this.move(0, 0, -1);
			} else {
				return;
			}
			// Unlock the engine
			this._map.getEngine().unlock();
		}
    }, // handleInput()
	
	// Move the "center" of viewport around the map
	move: function(dX, dY, dZ) {
		
		let newX = this._player.getX() + dX;
		let newY = this._player.getY() + dY;
		let newZ = this._player.getZ() + dZ;
		this._player.tryMove(newX, newY, newZ, this._map);
		
	}	// move()
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() { console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (let i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}

// Define our losing screen
Game.Screen.loseScreen = {
    enter: function() {    console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (let i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}