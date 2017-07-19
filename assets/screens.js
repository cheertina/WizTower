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
		display.drawText(1,23, "Press [Enter] to start!");
		display.drawText(1,24, "Press any other key for help.");
	},
	handleInput: function (inputType, inputData){
		// When [Enter] is pressed, go to the play screen
		if (inputType === 'keydown') {
			if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.playScreen);
			}
			if (inputData.keyCode !== ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.helpScreen);
			}
		}
	}
}

// Define our initial start screen
Game.Screen.helpScreen = {
	enter: function(){ console.log("Entered the help screen."); },
	exit: function(){ console.log("Exited the help screen"); },
	render: function(display){
		display.drawText(1,1, "%c{yellow}Instructions");
		display.drawText(1,3, "%c{white}Player control");
		display.drawText(2,4, "Move with numpad");
		display.drawText(2,5, "Press 0 or 5 to wait a round");
		display.drawText(1,7, "%c{white}Actions");
		display.drawText(2,8, "D: Drop item");
		display.drawText(2,9, "E: Eat consumable");
		display.drawText(2,10, "I: View inventory");
		display.drawText(2,11, "L: Enter/Exit 'Look' mode");
		display.drawText(2,12, "W: Wield/wear");
		display.drawText(2,13, ",: Pick up item");
		display.drawText(1,15, "%c{white}Other");
		display.drawText(2,16, "Select item (Inventory screen)");	
		display.drawText(1,24, "Press [Enter] to return");		
	},
	handleInput: function (inputType, inputData){
		// When [Enter] is pressed, go to the play screen if we haven't started the game
		if (inputType === 'keydown') {
			if (Game._currentScreen._subScreen){
				Game._currentScreen.setSubScreen(undefined);
				Game.refresh();
			} else if (inputData.keyCode === ROT.VK_RETURN) {
				Game.switchScreen(Game.Screen.startScreen);
			}
		}
	}
}

// Define our playing screen
Game.Screen.playScreen = {
	_map: null,
    _player: null,
	_gameEnded: false,
	_subScreen: null,
	
	// For looking around, mode='look'
	_cursor: {},
	_mode: 'play',
	
	enter: function() {
		console.log( "Entered playScreen." );
		
		var map = [];
		let width  = 80;
		let height = 24;
		let depth = 6;
		// Use our Builder to make the map
		var tiles = new Game.Builder(width, height, depth).getTiles();
		
		// Create map from the tiles and our player object
		this._player = new Game.Entity(Game.PlayerTemplate);
		this._map = new Game.Map(tiles, this._player)
		
		// Start the map's engine
		this._map.getEngine().start();
		
		this._player._magic.spellbook['test'] = Game.SpellBook.create('test');
		
	},//enter()
    
	exit: function() { console.log("Exited play screen."); },
	
    render: function(display) {
		// Render the subscreen, if it exists
		if (this._subScreen) {
			this._subScreen.render(display);
			return;
		}
		let screenWidth = Game.getScreenWidth();
		let screenHeight = Game.getScreenHeight();
		
		let screenCenter = {x: this._player.getX(), y: this._player.getY()}
		if(this._mode == 'look' || this._mode == 'target') {
			screenCenter.x = this._cursor.x;
			screenCenter.y = this._cursor.y;
		} else {
			this._cursor.x = this._player.getX();
			this._cursor.y = this._player.getY();
		}
		
		// make sure our viewport doesn't try to scroll off the map to the left
		// and don't scroll so far to the right that you don't have a full screen to display
		let topLeftX = Math.max(0, screenCenter.x - (screenWidth / 2));
		topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
		
		let topLeftY = Math.max(0, screenCenter.y - (screenHeight / 2));
		topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);

		
		// This will keep track of our visible cells
		var visibleCells = {};
		var cursorIsVisible = false;
		// Don't lose these values during callbacks
		var currentDepth = this._player.getZ();
		var map = this._map;
		// Find all visible cells and update teh object
		map.getFov(currentDepth).compute(
			this._player.getX(),
			this._player.getY(),
			this._player.getSightRadius(),
			function(x,y,radius, visibility){
				visibleCells[x + ',' + y] = true;
				// Mark visible cells as explored
				map.setExplored(x, y, currentDepth, true);
			}
		);
		
		
		// Iterate through all map cells that fit on the current screen
        for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
			for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
				// Render all tiles that have ever been seen
				if(true || map.isExplored(x, y, currentDepth)){
					// Fetch the glyph for the tile 
					let glyph = this._map.getTile(x, y, currentDepth);
					let foreground = glyph.getForeground();
					
					// If the cell is currently visible, see if there are
					// items or entities to render instead of the tile glyph
					
					if(true || visibleCells[x + ',' + y]){
						
						// Check  for items first, so that entities will render
						// "on top" of them
						let items = map.getItemsAt(x, y, currentDepth);

						// If there are any items, render the last one
						if (items){
							glyph = items[items.length - 1]; 
						}

						// Check if we have an entity
						if(map.getEntityAt(x, y, currentDepth)){
							glyph = map.getEntityAt(x, y, currentDepth);
						}
						// Update foreground color, in case it changed
						foreground = glyph.getForeground();
					} else {
						// Cell is not currently visible, but has been seen before
						foreground = 'dimGray';
					}
					// See if we need to render the cursor, too
					// box the character we want to show, just in case
					// The draw function handles arrays by combining the characters
					let dispChar = glyph.getChar();
					if ((this._mode == 'look' || this._mode == 'target') && this._cursor.x == x && this._cursor.y == y){
						dispChar.push('_');
						cursorIsVisible = true;
					}
					
					//call the draw function and actually render it
					display.draw(
						x - topLeftX,
						y - topLeftY,
						dispChar,
						foreground,
						glyph.getBackground()
					);
				} else if ((this._mode == 'look' || this._mode == 'target') && this._cursor.x == x && this._cursor.y == y) {	// If our look cursor is in unexplored territory
					display.draw(
						x - topLeftX,
						y - topLeftY,
						'_',
						'white',
						'black'
					)
					
					
				}
			}
		}
		
		// Get and render messages in the player's queue
		let messages = this._player.getMessages();
		var messageY = 0;
		for (let i = 0; i < messages.length; i++ ) {
			messageY += display.drawText(0, messageY, '%c{white}%b{black}' + messages[i]);
		}
		
		// STATUS RENDER
		// In play mode, show stats.  In look mode, show other things
		if(this._mode == 'play'){
			// Stats, row 1
			let status1_1 = vsprintf('HP: %d/%d   (%d, %d)',
				[this._player.getHp(), this._player.getMaxHp(),
				this._player.getX(), this._player.getY()]);
			let status1_2 = vsprintf('Weapon: %s  Ranged Weapon: %s  Armor: %s', [
				(this._player.getWeapon() ? this._player.getWeapon().describe() : "None"),
				(this._player.getRangedWeapon() ? this._player.getRangedWeapon().describe() : "None"),
				(this._player.getArmor() ? this._player.getArmor().describe() : "None")]);
			display.drawText(0, screenHeight,  '%c{white}%b{black}' + status1_1); // this hits row 1 of 2 blank at the bottom
			display.drawText(24, screenHeight, '%c{white}%b{black}' + status1_2); // this hits row 1 of 2 blank at the bottom
			// NOTE: screenHeight-1 is the last row of the playing field
			
			// Stats, row 2
			let status2_1 = vsprintf('Level: %d, XP: %d', [this._player.getLevel(), this._player.getXp()]);
			display.drawText(0, screenHeight+1, '%c{white}%b{black}' + status2_1);
			// show hunger in row two, right side
			let hungerState = this._player.getHungerState(false);	// use true for numeric debug. turn counting
			display.drawText(screenWidth - hungerState.length, screenHeight+1, '%c{white}%b{black}' + hungerState);
		
			// Stats, row 3 - mana
			let status3_1 = vsprintf('White %d/%d', [this._player._magic.mana.white, this._player._magic.maxMana.white]);
			let status3_2 = vsprintf('Black %d/%d', [this._player._magic.mana.black, this._player._magic.maxMana.black]);
			let status3_3 = vsprintf('Green %d/%d', [this._player._magic.mana.green, this._player._magic.maxMana.green]);
			let status3_4 = vsprintf('Blue %d/%d', [this._player._magic.mana.blue, this._player._magic.maxMana.blue]);
			let status3_5 = vsprintf('Red %d/%d', [this._player._magic.mana.red, this._player._magic.maxMana.red]);
			display.drawText( 0, screenHeight+2, "%c{white}%b{black}"+status3_1);
			display.drawText(15, screenHeight+2, "%c{black}%b{gray}" +status3_2);
			display.drawText(30, screenHeight+2, "%c{lime}%b{black}" +status3_3);
			display.drawText(45, screenHeight+2, "%c{cyan}%b{black}" +status3_4);
			display.drawText(60, screenHeight+2, "%c{red}%b{black}"  +status3_5);
		
		
		} 
		if (this._mode == 'look' || this._mode == 'target') { // In either 'look' or 'target' mode, show what's under the cursor
			let lookText = '';
			if (cursorIsVisible) {
				let capitalize = true;
				let entAt =  map.getEntityAt(this._cursor.x, this._cursor.y, currentDepth);
				let itemsAt = map.getItemsAt(this._cursor.x, this._cursor.y, currentDepth);
				let tileAt =     map.getTile(this._cursor.x, this._cursor.y, currentDepth);
				if (entAt){
					if(entAt._name !== 'you'){
						lookText += entAt.describeA(capitalize);
					} else {
						lookText += 'You';
					}
					capitalize = false;
				}
				if (itemsAt) {
					if (!capitalize) { lookText += ' and '}
					lookText += itemsAt[0].describeA(capitalize);
					if(itemsAt.length > 1) {lookText += ' and other items'}
				}
				if(!entAt && !itemsAt){
					lookText += tileAt._name;
				}
				
			} else {
				lookText = 'Unexplored';
			}
			display.drawText(0, screenHeight+1, lookText);
		}
		if (this._mode == 'target') {
			display.drawText(0, screenHeight, "Targeting ranged attack");
		}
		
    }, //render()
	
    handleInput: function(inputType, inputData) {
		// If there's a subscreen, use that handler instead
		if(this._subScreen){
			this._subScreen.handleInput(inputType, inputData);
			return;
		}
		if (inputType === 'keydown') {
			// If the game is over, press any key to go to Game Over screen
			if (this._gameEnded){
				if (inputData.keyCode === ROT.VK_RETURN) {
					Game.switchScreen(Game.Screen.loseScreen);
				}
				return; // Don't respond to any other input
			}
			// In look mode
			if (this._mode == 'look'){
				if (inputData.keyCode ===ROT.VK_L){ 
					this._mode = 'play';
					return; 
				}
			}
			// Targeting a ranged attack (and eventually a ranged spell)
			if (this._mode == 'target'){
				// Confirm Attack
				if (inputData.keyCode === ROT.VK_RETURN) {
					console.log('I should be making a ranged attack');
					if(this._mode == 'target'){
						var target = this._map.getEntityAt(this._cursor.x, this._cursor.y, this._player.getZ());
						if(target){
							this._player.rangedAttack(target, this._player.getAmmoSlot());
						} else {
							let m = this._map;
							let aS = this._player.getAmmoSlot();
							let ammoItem = this._player.removeItem(aS);
							m.addItem(this._cursor.x+','+this._cursor.y+','+this._player.getZ(), ammoItem);
						}
						this._mode = 'play';
						this._map.getEngine().unlock();
					}
				}
				// Cancel Attack
				if (inputData.keyCode === ROT.VK_ESC) {
					this._mode = 'play';
					return;
				}
			}
			// If you're moving a cursor
			if (this._mode == 'look' || this._mode == 'target'){
				console.log("In look mode, inputData.keyCode: " + inputData.keyCode);
				switch(inputData.keyCode){
					case ROT.VK_NUMPAD1: {this.cursorMove(-1,  1); break; }
					case ROT.VK_NUMPAD2: {this.cursorMove( 0,  1); break; }
					case ROT.VK_NUMPAD3: {this.cursorMove( 1,  1); break; }
					case ROT.VK_NUMPAD4: {this.cursorMove(-1,  0); break; }
					case ROT.VK_NUMPAD6: {this.cursorMove( 1,  0); break; }
					case ROT.VK_NUMPAD7: {this.cursorMove(-1, -1); break; }
					case ROT.VK_NUMPAD8: {this.cursorMove( 0, -1); break; }
					case ROT.VK_NUMPAD9: {this.cursorMove( 1, -1); break; }
					case ROT.VK_ESCAPE: { this._mode = 'play'; }
				}
				Game.refresh();
				return;
			}
			
			// Default gameplay mode
				
			switch(inputData.keyCode){
				// Movement
				case ROT.VK_NUMPAD1: this.move(-1,  1, 0); break;
				case ROT.VK_NUMPAD2: this.move( 0,  1, 0); break;
				case ROT.VK_NUMPAD3: this.move( 1,  1, 0); break;
				case ROT.VK_NUMPAD4: this.move(-1,  0, 0); break;
				case ROT.VK_NUMPAD5: break; 	// Spend a turn to do nothing - wait
				case ROT.VK_NUMPAD6: this.move( 1,  0, 0); break;
				case ROT.VK_NUMPAD7: this.move(-1, -1, 0); break;
				case ROT.VK_NUMPAD8: this.move( 0, -1, 0); break;
				case ROT.VK_NUMPAD9: this.move( 1, -1, 0); break;				
				/*  TODO: Make sure these are "costing" turns as appropriate - we've deviated from the tutorial
				*  I _think_ that any branch that hits a "return" should be free,
				*  and anything that doesn't needs to hit a "break" to avoid fall-through
				*  turns are spent if the executeOkFunction on the subscreen returns true
				*  there might be an automatic cost on any branch that calls executeOkFunction
				*  but you can't see that here, so grab a console.log, and good luck.
				*
				*  Use this._player.getHungerState(true); in the status render for accurate turn counting
				*/
				
				//  Now with unnecessary (optional) braces, for nice folding
				
				// DEBUG COMMANDS
				
				case ROT.VK_N:{ // Let's plow through stuff like walls and enemies
					if (inputData.shiftKey) { 
						this._player.removeMixin(Game.EntityMixins.Digger);
						this._player.removeMixin(Game.EntityMixins.Trample);
					}
					else{
						this._player.addMixin(Game.EntityMixins.Digger); 
						this._player.addMixin(Game.EntityMixins.Trample); 
					} 
					return; 
				}
				
				case ROT.VK_C:{
					if (inputData.shiftKey) { 
					}
					else{
						this._player.castSpell('test', this._player);
					} 
					return;
				}
				//
				// END DEBUG
				
				// Testing Commands
				
				case ROT.VK_P:{
					let pos = this._player.getPos();
					let tile = this._map.getTile(pos.x, pos.y, pos.z);
					if (tile.getName() == 'altar' && tile.isActive() == false){ // if we're on an unactivated altar
						Game.Screen.gainMagic.setup(this._player, pos, tile);
						this.setSubScreen(Game.Screen.gainMagic);
					}
	
					return;
				}
				// End testing
				
				// Working Commands
				// DROP ITEM
				case ROT.VK_D: {
					this.showItemsSubScreen(Game.Screen.dropScreen , this._player.getItems(), "You're not carrying anything to drop.");
					return;
				}
				// EAT COMESTIBLE
				case ROT.VK_E: {
					this.showItemsSubScreen(Game.Screen.eatScreen , this._player.getItems(), "You're not carrying anything to eat.");
					return;
				}
				// INVENTORY
				case ROT.VK_I: {
					this.showItemsSubScreen(Game.Screen.inventoryScreen , this._player.getItems(), "You are not carrying anything.");
					return;
				}
				// LOOK
				case ROT.VK_L: {
					this._mode = 'look';
					Game.refresh();
					return;
				}
				// RANGED ATTACK
				case ROT.VK_R:{ 
					if(!this._player.getRangedWeapon()){
						Game.sendMessage(this._player, "You're not wielding a ranged weapon");
						Game.refresh();
						return;
					}
					if(this._player.getAmmoSlot() == -1){	// getAmmoSlot returns an array index or -1 if no ammo
						Game.sendMessage(this._player, "You don't have any ammo for that");
						Game.refresh();
						return;
					}
					this._mode = 'target';
					Game.refresh();
					return;
				}
				// {none} WIELD
				// {shift} WEAR
				case ROT.VK_W: {
					if (inputData.shiftKey){ 
						this.showItemsSubScreen(Game.Screen.wearScreen , this._player.getItems(), "You have nothing to wear");
					} else {
						this.showItemsSubScreen(Game.Screen.wieldScreen , this._player.getItems(), "You have nothing to wield.");
					}
					return;
				}
				// {none} PICK UP ITEMS
				// {shift} GO UP STAIRS
				case ROT.VK_COMMA: {
					if (inputData.shiftKey) { 
						this.move(0, 0, -1); 
						break; 
					}
					let items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ())
					// If there are no items, show a message
					if (items && items.length === 1){
						let item = items[0];
						if(this._player.pickupItems([0])) {
							Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
							break;	// break so we don't hit the return below (and get to 'skip' unlocking for our turn)
						} else {
							Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
							Game.refresh();
						}
					} else { // Show the pickup screen since there are multiple items
						this.showItemsSubScreen(Game.Screen.pickupScreen, items, "There is nothing here to pick up.");
					}
					return;
				}
				// {none} No function
				// {shift}: GO DOWN STAIRS
				case ROT.VK_PERIOD: {
					if (inputData.shiftKey){
						this.move(0, 0, 1);
						break;
					}
				}
				// {none}: No function
				// {shift}: HELP MENU
				case ROT.VK_SLASH: {	
					if(inputData.shiftKey) {
						this.setSubScreen(Game.Screen.helpScreen);
						return;
					}
				}
				// DEFAULT CASE - you hit a button that doesn't do anything
				default: return;
			}
				// This is where we actually end our turn
				// if we return before here, we get to 'go again'
				// e.g. checking the inventory, picking up no items, dropping no items
				this._map.getEngine().unlock();
			
        }
    }, // handleInput()
	
	// Move the "center" of viewport around the map
	move: function(dX, dY, dZ) {
		
		let newX = this._player.getX() + dX;
		let newY = this._player.getY() + dY;
		let newZ = this._player.getZ() + dZ;
		this._player.tryMove(newX, newY, newZ, this._map);
		
	},	// move()
	cursorMove: function(dX, dY){
		let newX = Math.max(0,Math.min(this._map.getWidth(), this._cursor.x + dX));
		let newY = Math.max(0,Math.min(this._map.getHeight(), this._cursor.y + dY));
		this._cursor.x = newX;
		this._cursor.y = newY;
	},
	setGameEnded: function(gameEnded){
		this._gameEnded = gameEnded;
	},
	setSubScreen: function(subScreen) {
		this._subScreen = subScreen;
		// Refresh the screen to render the subscreen
		Game.refresh();
	},
	showItemsSubScreen: function(subScreen, items, emptyMessage){
		if (items && subScreen.setup(this._player, items) > 0) {
			this.setSubScreen(subScreen);
		} else {
			Game.sendMessage(this._player, emptyMessage);
			Game.refresh();
		}
	}
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

// Level up stat gain screen
Game.Screen.gainStatScreen = {
	setup: function(entity) {
		// Must be called before rendering
		this._entity = entity;
		this._options = entity.getStatOptions();
	},
	render: function(display){
		let letters = 'abcdefghijklmnopqrstuvwxyz';
		display.drawText(0, 0, 'Choose a stat to increase: ');
		
		// Iterate through available stats to improve
		for (let i = 0; i < this._options.length; i++){
			display.drawText(0, 2+i, letters.substring(i,i+1) + ' - ' + this._options[i][0]);
		}
		
		// Display number of remaining points to distribute
		display.drawText(0, 4 + this._options.length, "Remaining points: " + this._entity.getStatPoints());
	},
	handleInput: function(inputType, inputData) {
		if (inputType === 'keydown') {
			// If it's a letter, see if it's a valid options
			if (inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z){
				// Subtract 'a' to map to an array index
				let index = inputData.keyCode - ROT.VK_A;
				if (this._options[index]) {
					// Call the stat increasing function
					this._options[index][1].call(this._entity);
					// Decrement stat points to spend
					this._entity.setStatPoints(this._entity.getStatPoints() - 1);
					// If we have no stat points left, exit the screen.  If not, refresh
					if (this._entity.getStatPoints() == 0) {
						Game.Screen.playScreen.setSubScreen(undefined);
					} else {
						Game.refresh();
					}
				}
			}
		}
	}
};

// Magic stat gain
// If not an an altar, shows current magic stats
Game.Screen.gainMagic = {
	setup: function(entity, pos, tile) {
		// Must be called before rendering
		this._entity = entity;
		this._pos = pos;
		this._tile = tile;
	},
	render: function(display){
		display.drawText(0, 0, "Channel which color mana?");
		display.drawText(0, 2, "%c{white}%b{black}W - White - " + this._entity._magic.mana['white'] + "/" + this._entity._magic.maxMana['white']);
		display.drawText(0, 4, "%c{black}%b{gray}B - Black - " + this._entity._magic.mana['black'] + "/" + this._entity._magic.maxMana['black']);
		display.drawText(0, 6, "%c{lime}%b{black}G - Green - " + this._entity._magic.mana['green'] + "/" + this._entity._magic.maxMana['green']);
		display.drawText(0, 8, "%c{cyan}%b{black}U - Blue - "  + this._entity._magic.mana['blue']  + "/" + this._entity._magic.maxMana['blue'] );
		display.drawText(0, 10,"%c{red}%b{black}R - Red - "   + this._entity._magic.mana['red']   + "/" + this._entity._magic.maxMana['red']  );
		
	},
	handleInput: function(inputType, inputData){
		if (inputType === 'keydown'){
			let activated = false;
			let actColor = '';
			switch(inputData.keyCode){
				
				case ROT.VK_W:{
					activated = true;
					actColor = 'white';
					break;
				}
				case ROT.VK_B:{
					activated = true;
					actColor = 'black';
					break;
				}
				case ROT.VK_G:{
					activated = true;
					actColor = 'green';
					break;
				}
				case ROT.VK_U:{
					activated = true;
					actColor = 'blue';
					break;
				}
				case ROT.VK_R:{
					activated = true;
					actColor = 'red';
					break;
				}
				
				case ROT.VK_ESCAPE:{
					Game.Screen.playScreen.setSubScreen(undefined);
					break;
				}
				
				default: 
				console.log(JSON.stringify(this._entity._magic));
				return;
				
			}
				
			if (activated){
				this._entity._magic.increaseMaxMana(actColor);
				Game.Screen.playScreen.setSubScreen(undefined);
				this._tile._active = true;
				if(actColor == 'black'){ this._tile._background = 'gray'};
			
				if(actColor == 'green') { this._tile._foreground = 'lime'; }
				else if(actColor == 'blue') { this._tile._foreground = 'cyan'; }
				else { this._tile._foreground = actColor; }
			}
			
		}
	}
	
};

// An Item list based on template for different use cases
// inventory list, pick up, drop, etc.
Game.Screen.ItemListScreen = function(template){
	this._caption = template['caption'];
	this._okFunction = template['ok'];
	// Function to filter items for spcific lists (edible, weapons, etc.)
	// By default, use the identity function (all items)
	this._filterFunction = template['filterFunction'] || function(x) { return x; }
	// Whether items are selectable
	this._canSelectItem = template['canSelect'];
	// Whether the user can select multiple items
	this._multiSelect = template['multiSelect'];
	// Whether 'No Item' shuold be an option
	this._canSelectNone = template['canSelectNone'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items){
	this._player = player;
	// Should be called before switching to the screen
	
	// Iterate over all items, keep (and count) only the ones that match
	// our filterFunction
	let count = 0;
	let that = this;
	this._items = items.map(function(item) {
		// return the item, if it matches, or null if not
		if(that._filterFunction(item)) {
			count++;
			return item;
		} else {
			return null;
		}
	});
	// Clean the set of selected indices
	this._selectedIndices = {};
	return count;
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
	let letters = 'abcdefghijklmnopqrstuvwxyz';
	//Render the caption in the top row
	display.drawText(0,0, this._caption);
	let row = 2;	// Leave a blank line after the caption, and start rendering at row 2 (usually)
	if (this._canSelectNone) { display.drawText(0, 1, '0 - no item'); }
	for (let slot = 0; slot < this._items.length; slot++) {
		// If we have an item, we want to list it
		if (this._items[slot]) {
			// Get the letter matching the item's index
			let letter = letters.substring(slot, slot+1);
			// If an item is selected, show a '+',
			// otherwise a '-' between the letter and name
			let selectionState = (this._canSelectItem && this._multiSelect && this._selectedIndices[slot]) ? '+' : '-';
			let suffix = '';
			if (this._items[slot] === this._player.getArmor()) { suffix = ' (wearing)'; }
			if (this._items[slot] === this._player.getWeapon()){ suffix = ' (wielding)'; }
			if (this._items[slot] === this._player.getRangedWeapon()){ suffix = ' (ranged)'; }
			dispStr = letter + ' ' + selectionState+ '   ' + this._items[slot].describe() + suffix;
			display.drawText(0, row, dispStr);
			// Display the character for the item, in the right color
			display.draw(4, row, this._items[slot].getChar(), this._items[slot].getForeground());
			
		}
		row++;
	}
	display.drawText(0, Game.getScreenHeight()+1, '0, [a-z] to select, Esc to exit, Enter to confirm');
};

Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
	// Gather the selected items
	let selectedItems = {};
	for (var key in this._selectedIndices){
		selectedItems[key] = this._items[key];
	}
	// Switch back to the play screen
	Game.Screen.playScreen.setSubScreen(null);
	// Call the OK function and end the players turn if it returns true
	if (this._okFunction(selectedItems)) {
		this._player.getMap().getEngine().unlock();
	}
};

Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
	if (inputType === 'keydown'){
		// If the user hit escape, hit enter and can't select an item, or hit enter
		// without any items selected, bail out
		if (inputData.keyCode === ROT.VK_ESCAPE || 
			(inputData.keyCode === ROT.VK_RETURN && 
				(!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
			Game.Screen.playScreen.setSubScreen(null);
		// Handle pressing return when items are selected
		// Handle selection of 'no item'
		} else if (inputData.keyCode === ROT.VK_RETURN || (inputData.keyCode === ROT.VK_0 && this._canSelectNone)) {
			this.executeOkFunction();
		
		// Handle pressing a letter if we can select
		} else if (this._canSelectItem && inputData.keyCode >= ROT.VK_A && inputData.keyCode <=ROT.VK_Z) {
			// Map letter to slot # by subtracting the value of 'a'
			let index = inputData.keyCode - ROT.VK_A;
			if (this._items[index]){
				// If multi-select is allowed, toggle the selection status
				if (this._multiSelect) {
					if(this._selectedIndices[index]) {
						delete this._selectedIndices[index];
					} else {
						this._selectedIndices[index] = true;
					}
					// Redraw the screen
					Game.refresh();
				} else {// If not, exit with selected item
					this._selectedIndices[index] = true;
					this.executeOkFunction();
				}
			}
		}
	}
};

Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
	caption: 'Inventory',
	canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
	caption: 'Pick up which items?',
	canSelect: true,
	multiSelect: true,
	ok: function(selectedItems){
		// Try to pick up everything, alert the player if not all can be
		if (!this._player.pickupItems(Object.keys(selectedItems))) {
			Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
		}
		return true;
	}
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
	caption: 'Drop which item?',
	canSelect: true,
	multiSelect: false,
	ok: function(selectedItems){
		// Drop the selected item
		this._player.dropItem(Object.keys(selectedItems)[0]);
		return true;
	}
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
	caption: 'Eat which item?',
	canSelect: true,
	multiSelect: false,
	filterFunction: function(item) { return item && item.hasMixin('Edible'); },
	ok: function(selectedItems){
		let key = Object.keys(selectedItems)[0];
		let item = selectedItems[key];
		Game.sendMessage(this._player, "You eat %s.", [item.describeThe()]);
		item.eat(this._player)
		if( !item.hasRemainingConsumptions()) {
			this._player.removeItem(key);
		}
		return true;
	}
});

Game.Screen.wieldScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to wield',
	canSelect: true,
	multiSelect: false,
	canSelectNone: true,
	filterFunction: function(item){ return item && item.hasMixin('Equippable') && item.isWieldable(); },
	ok: function(selectedItems){
		// Check if we selected 'no item'
		let keys = Object.keys(selectedItems);
		if(keys.length === 0) {
			this._player.unwield();
			this._player.unwieldRanged();
			Game.sendMessage(this._player, "You are empty handed.");
		} else {
			// Unequip the item first in case it is also armor and can't be worn and wielded at the same time
			let item = selectedItems[keys[0]];
			this._player.unequip(item);
			this._player.wield(item);
			Game.sendMessage(this._player, "You are wielding %s.", [item.describeA()]);
		}
		return true;
	}
});

Game.Screen.wearScreen = new Game.Screen.ItemListScreen({
	caption: 'Choose the item you wish to wear',
	canSelect: true,
	multiSelect: false,
	canSelectNone: true,
	filterFunction: function(item){ return item && item.hasMixin('Equippable') && item.isWearable(); },
	ok: function(selectedItems){
		// Check if we selected 'no item'
		let keys = Object.keys(selectedItems);
		if(keys.length === 0) {
			this._player.unwear();
			Game.sendMessage(this._player, "You are not wearing anything");
		} else {
			// Unequip the item first in case it is also a weapon and can't be worn and wielded at the same time
			let item = selectedItems[keys[0]];
			this._player.unequip(item);
			this._player.wear(item);
			Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
		}
		return true;
	}
});

	



