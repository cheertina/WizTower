// Create our EntityMixins namespace
Game.EntityMixins = {};

// Generic Mixins
Game.EntityMixins.Attacker = { // Entity can attack and cause damage
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template){
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function(){ return this._attackValue; },
	attack: function(target){
		if(target.hasMixin('Destructible')){
			let attack = this.getAttackValue();
			let defense = target.getDefenseValue();
			let max = Math.max(0, attack - defense);
			let damage = 1 + Math.floor(Math.random() * max);
			
			Game.sendMessage(this, 'You strike the %s for %d damage!', [target.getName(), damage]);
			Game.sendMessage(target, 'The %s strikes you for %d damage', [this.getName(), damage]);
			
			target.takeDamage(this, damage);
		}
	}
} // Attacker

Game.EntityMixins.Destructible = { // Entity can take damage and be destroyed
	name: 'Destructible',
	init: function(template) {
		this._maxHp = template['maxHp'] || 10;
		this._hp = template['Hp'] || this._maxHp;
		this._defenseValue = template['defenseValue'] || 0;
	},
	getHp: function() {	return this._hp; },
	getMaxHp: function(){ return this._maxHp; },
	getDefenseValue: function(){ return this._defenseValue; },
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If hp drops to 0 or less, remove ourselves from the map via Game.Entity.kill()
		if (this._hp <= 0){
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            this.kill();
		}
	}
}; //Destructible

Game.EntityMixins.MessageRecipient = { // Entity is able to receive messages - see helpers
	name: 'MessageRecipient',
	init: function(template){ this._messages = []; },
	receiveMessage: function(message) { this._messages.push(message); },
	getMessages: function(){ return this._messages; },
	clearMessages: function() { this._messages = []; }
};

Game.EntityMixins.Digger = { // Entity can dig walls
	name: 'Digger',
}

Game.EntityMixins.Sight = { // Signifies that our entity posseses a field of vision in a radius
	name: 'Sight',
	groupName: 'Sight',
	init: function(template){
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
};

Game.EntityMixins.InventoryHolder = { // Entity can pickup/drop/carry items
	name: 'InventoryHolder',
	init: function(template) {
		// Default to 10 inventory slots
		let inventorySlots = template['inventorySlots'] || 10;
		// Set up an empty inventory
		this._items = new Array(inventorySlots);
	},
	getItems: function() {
		return this._items;
	},
	getItem: function(i) {
		return this._items[i];
	},
	addItem: function(item) {
		// Find an empty slot, or return false if we can't add the item
		for(let slot = 0; slot < this._items.length; slot++) {
			if (!this._items[slot]) {
				this._items[slot] = item;
				return true;
			}
		}
		return false;
	},
	removeItem: function(slot){
		this._items[slot] = null;
	},
	canAddItem: function(item) {
		// Find an empty slot, or return false if we can't add the item
		for(let slot = 0; slot < this._items.length; slot++) {
			if (!this._items[slot]) {
				return true;
			}
		}
		return false;
	},
	pickupItems: function(indices){
		// Pick up items from the map, where indices is the indices for the array
		// returned by map.getItemsAt
		let mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
		let added = 0;
		// Iterate through the indices
		for (let i = 0; i < indices.length; i++) {
			// Try to add the item.  If the inventory isn't full, then splice the
			// item out of the list of items.  In order to fetch the right item, we
			// have to offset the number of items already added
			if (this.addItem(mapItems[indices[i] - added])) {
				mapItems.splice(indices[i] - added, 1);
				added++;
			} else {
				//inventory is full
				break;
			}
		}
		// Update the map items
		this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
		// Return true only if we added _all_ the items
		return added ===indices.length;
	},
	dropItem: function(slot){
		if(this._items[slot]) {
			this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[slot]);
			this.removeItem(slot);
		}
	}
};

Game.EntityMixins.FoodConsumer = { // Entity can/must eat
	name: 'FoodConsumer',
	init: function(template){
		this._maxFullness = template['maxFullness'] || 1000;
		// Start half-full by default
		this._fullness = template['fullness'] || (this._maxFullness / 2);
		// Number of points to subtract each turn
		this._fullnessDepletionRate = template['fullnessDepletionRate'] || 1;
	},
	addTurnHunger: function(){
		this.modifyFullnessBy(-this._fullnessDepletionRate);
	},
	modifyFullnessBy: function(points) {
		this._fullness = this._fullness + points;
		if (this._fullness <= 0) {
			// TODO: Take damage equal to how negative your fullness is
			// this.takeDamage(null, -this._fullness);
			// For now, we'll do it the tutorial's way
			this.kill();
		} else if (this._fullness > this.maxFullness){
			this.kill();
		}
	},
	getHungerState: function(numeric = false) {
		if (numeric) { return 'Hunger: ' + this._fullness; }
		// This math looks weird, but it's right
		let percent = this._maxFullness / 100;
		if (this._fullness <= 5 * percent) { return 'Starving'; }
		else if (this._fullness <= 25 * percent) { return 'Hungry'; }
		else if (this._fullness >= 95 * percent) { return 'Oversatiated'; }
		else if (this._fullness >= 75 * percent) { return 'Full'; }
		else { return 'Not Hungry'; }
	}
};

// AI Mixins - 'Actor' group
Game.EntityMixins.PlayerActor = {
// Main player's actor mixin
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function(){
		// This can be called twice if we 'die' twice or hunger kills us,
		// so bail out if we're already dead
		if (this._acting) { return; }
		this._acting = true;
		
		this.addTurnHunger();
		// Detect if the game is over
        if (!this.isAlive()) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
        }
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously
		// for keyboard input
		this.getMap().getEngine().lock();
		Game.Screen.playScreen._turns++;
		// Clear the message queue
		this.clearMessages();
		
		this._acting = false;
	}
};

Game.EntityMixins.FungusActor = {	// Fungus cannot move, but can spread
	name: 'FungusActor',
	groupName: 'Actor',
	init: function(){ 
		this._growthsRemaining = 5; 
	},
	act: function(){
		if(this._growthsRemaining > 0){
			if(Math.random() <= .02){ // 2% chance to spread
				// Generate a random dX and dY of -1, 0, or 1
				let xOffset = Math.floor(Math.random() * 3) - 1;
				let yOffset = Math.floor(Math.random() * 3) - 1;
				// Don't spread to the space we're on, add an extra growthRemaining instead
				if (xOffset != 0 || yOffset != 0){
					// Can only spread to empty tiles
					target = {x: this.getX() + xOffset,
							  y: this.getY() + yOffset,
							  z: this.getZ()
					}
					if (this.getMap().isEmptyFloor(target.x, target.y, target.z)){
						let entity = Game.EntityRepository.create('fungus');
						entity.setPosition(target.x, target.y, target.z);
						this.getMap().addEntity(entity);
						this._growthsRemaining--;
						
						// Send a message to nearby entities
						Game.sendMessageNearby(this.getMap(),
							entity.getX(), entity.getY(), entity.getZ(),
							'The fungus is spreading!');
					}
				} else {
					this._growthsRemaining++;
				}
			}
		}
	} //act()
};

Game.EntityMixins.WanderActor = {
	name: 'WanderActor',
	groupName: 'Actor',
	act: function(){
		// Moves randomly
		let dir = Math.floor(Math.random() * 8) + 1;
		let newX = this.getX();
		let newY = this.getY();
		switch(dir){
			case 1: newX += -1; newY +=  1; break;
			case 2: newX +=  0; newY +=  1; break;
			case 3: newX +=  1; newY +=  1; break;
			case 4: newX += -1; newY +=  0; break;
			case 5: newX +=  1; newY +=  0; break;
			case 6: newX += -1; newY += -1; break;
			case 7: newX +=  0; newY += -1; break;
			case 8: newX +=  1; newY += -1; break;
		}
		this.tryMove(newX, newY, this.getZ());
	}
};


// Helper functions
Game.sendMessage = function(recipient, message, args) { // Send a message to an entity
	// Make sure the recipient can receive the message
	if (recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
		// Format the message, but only if args are passed
		if(args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
		console.log("To "+ recipient.getName() + ": " + message);
	}
};	// sendMessage

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) { // Send a message to all entities near a target space
	// Format message, but only if args were passed
	if (args){
		message = vsprintf(message, args);
	}
	// Get the nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
	// Iterate through nearby entities and send the message if they can receive it
	for (let i = 0; i < entities.length; i++){
		if (entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
}; // sendMessageNearby

