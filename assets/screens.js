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
		let mapWidth  = 250;
		let mapHeight = 250;
		// Create the map array, and fill it with null tiles
		for (var x = 0; x < mapWidth; x++) {
			// Create the nested array for the y values;
			map.push([]);
			for (var y = 0; y < mapHeight; y++){
				map[x].push(Game.Tile.nullTile);
			}
		}
		
		let mapStyle = null;
		//mapStyle = "nethack";
		if(mapStyle == "nethack"){			
			let generator = new ROT.Map.Uniform(mapWidth, mapHeight, {timeLimit: 5000});
			generator.create(function(x,y,v) {
				if(v === 0){
					map[x][y] = Game.Tile.floorTile;
				}else{
					map[x][y] = Game.Tile.wallTile;
				}
			});
			
		} else {
			//this will give us an array of 1's and 0's
			let generator = new ROT.Map.Cellular(mapWidth, mapHeight);
			generator.randomize(0.5);
			let totalIterations = 3;	// Each iteration smooths the map
			for (let i = 0; i < totalIterations - 1; i++) {
				generator.create();
			}
			//One last pass and update the map as we do
			generator.create(function(x,y,v){
				if(v === 1) {
					map[x][y] = Game.Tile.floorTile;
				} else {
					map[x][y] = Game.Tile.wallTile;
				}
			});
		}	
		// Create map from the tiles
		this._map = new Game.Map(map);
		
		// Create the player object and set the position
		this._player = new Game.Entity(Game.PlayerTemplate);
		var position = this._map.getRandomFloorPosition();
		this._player.setX(position.x);
		this._player.setY(position.y);
		
	},//enter()
    
	exit: function() { console.log("Exited play screen."); },
	
    render: function(display) {
		console.log("drawing the display");
		let screenWidth = Game.getScreenWidth();
		let screenHeight = Game.getScreenHeight();
		console.log("Width: " + screenWidth + ", Height: "+screenHeight);
		
		// make sure our viewport doesn't try to scroll off the map to the left
		// and don't scroll so far to the right that you don't have a full screen to display
		let topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		
		let topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
		console.log("topLeft x,y: "+topLeftX + ", "+topLeftY);
		
		// Iterate through all visile map cells
        for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
				//Fetch the glyph for the tile and render it to the screen
				// at the offest position
				let tile = this._map.getTile(x, y);
				display.draw(
					x - topLeftX,
					y - topLeftY,
					tile.getChar(),
					tile.getForeground(),
					tile.getBackground()
				);
			}
		}
		// Render the player
		display.draw(
			this._player.getX() - topLeftX,
			this._player.getY() - topLeftY,
			this._player.getChar(true),
			this._player.getForeground(true),
			this._player.getBackground(true)
			);
		
		
    }, //render()
	
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
			// Movement
			switch(inputData.keyCode){
				case ROT.VK_NUMPAD1: this.move(-1,  1); break;
				case ROT.VK_NUMPAD2: this.move( 0,  1); break;
				case ROT.VK_NUMPAD3: this.move( 1,  1); break;
				case ROT.VK_NUMPAD4: this.move(-1,  0); break;
				case ROT.VK_NUMPAD5: this.move( 0,  0); break;
				case ROT.VK_NUMPAD6: this.move( 1,  0); break;
				case ROT.VK_NUMPAD7: this.move(-1, -1); break;
				case ROT.VK_NUMPAD8: this.move( 0, -1); break;
				case ROT.VK_NUMPAD9: this.move( 1, -1); break;				
			}
        }    
    }, // handleInput()
	
	// Move the "center" of viewport around the map
	move: function(dX, dY) {
		
		let newX = this._player.getX() + dX;
		let newY = this._player.getY() + dY;
		this._player.tryMove(newX, newY, this._map);
		
	}	// move()
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() { console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
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
        for (var i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}