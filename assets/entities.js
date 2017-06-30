// Create our Mixins namespace
Game.Mixins = {};

Game.Mixins.Attacker = {
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

Game.Mixins.Destructible = {
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
		// If hp drops to 0 or less, remove this entity
		if (this._hp <= 0){
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            Game.sendMessage(this, 'You die!');
            this.getMap().removeEntity(this);
		}
	}
} //Destructible

Game.Mixins.MessageRecipient = {
	name: 'MessageRecipient',
	init: function(template){ this._messages = []; },
	receiveMessage: function(message) { this._messages.push(message); },
	getMessages: function(){ return this._messages; },
	clearMessages: function() { this._messages = []; }
}

Game.sendMessage = function(recipient, message, args) {
	// Make sure the recipient can receive the message
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
		// Format the message, but only if args are passed
		if(args) {
			message = vsprintf(message, args);
		}
		recipient.receiveMessage(message);
		console.log("To "+ recipient.getName() + ": " + message);
	}
}	// sendMessage

Game.sendMessageNearby = function(map, centerX, centerY, message, args) {
	// Format message, but only if args were passed
	if (args){
		message = vsprintf(message, args);
	}
	// Get the nearby entities
	entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
	// Iterate through nearby entities and send the message if they can receive it
	for (let i = 0; i < entities.length; i++){
		if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
} // sendMessageNearby

Game.Mixins.Movable = {
	name: 'Movable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);
		// Can't move onto an entity
		if(target) {
			// If we're an attacker, attack the target
			if(this.hasMixin('Attacker')){
				this.attack(target);
				return true;
			}
			else{
				// If not, nothing we can do, and we can't move
				// onto the tile
				return false;
			}
		}
		// Check if we can walk on the tile
		// and do so, if possible
		if (tile.isWalkable()){
			// Update the entity's position
			this._x = x;
			this._y = y;
			return true;
		} else if (tile.isDiggable()) {
			map.dig(x, y);
			return true;
		}
		return false;
	}
}	// Movable

// Main player's actor mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function(){
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously
		// for keyboard input
		this.getMap().getEngine().lock();
		// Clear the message queue
		this.clearMessages();
	}
}

Game.Mixins.FungusActor = {
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
							  y: this.getY() + yOffset
					}
					if (this.getMap().isEmptyFloor(target.x, target.y)){
						let entity = new Game.Entity(Game.Templates.Fungus);
						entity.setX(target.x);
						entity.setY(target.y);
						this.getMap().addEntity(entity);
						this._growthsRemaining--;
						
						// Send a message to nearby entities
						Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(), 'The fungus is spreading!');
						
					}
				} else {
					this._growthsRemaining++;
				}
			}
		}
	} //act()
}

// Entity Templates
Game.Templates = {}

Game.Templates.Player = {
	name: 'you',
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHP: 40,
	attackValue: 10,
	mixins: [
		Game.Mixins.Movable,
		Game.Mixins.PlayerActor,
		Game.Mixins.MessageRecipient,
		Game.Mixins.Attacker,
		Game.Mixins.Destructible]
}

Game.Templates.Fungus = {
	name: 'fungus',
	character: 'F',
	foreground: 'lime',
	maxHp: 10,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}