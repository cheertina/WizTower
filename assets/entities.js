// Create our Mixins namespace
Game.Mixins = {};

// Mixins
Game.Mixins.Attacker = { // Entity can attack and cause damage
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

Game.Mixins.Destructible = { // Entity can take damage and be destroyed
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
            // Don't remove the player - their act() function handles transition to Game Over screen
			if(this.hasMixin(Game.Mixins.PlayerActor)){
				this.act();
			} else {
				this.getMap().removeEntity(this); 
			}
		}
	}
}; //Destructible

Game.Mixins.MessageRecipient = { // Entity is able to receive messages - see helpers
	name: 'MessageRecipient',
	init: function(template){ this._messages = []; },
	receiveMessage: function(message) { this._messages.push(message); },
	getMessages: function(){ return this._messages; },
	clearMessages: function() { this._messages = []; }
};

Game.Mixins.Digger = { // Entity can dig walls
	name: 'Digger',
}
/*	We refactored this to give all entities access to tryMove
Game.Mixins.Movable = { // Signifies that the entity can move
	name: 'Movable',
	tryMove: function(x, y, z, map) {
		var tile = map.getTile(x, y, this.getZ());
		var target = map.getEntityAt(x, y, this.getZ());
		// If we're trying to change Z coord, make sure we're on
		// the right kind of stairs
		if (z < this.getZ()){
			if (tile != Game.Tile.stairsUpTile){
				Game.sendMessage(this, "You can't go up here!");
			} else {
				Game.sendMessage(this, "You ascend to level %d", [z + 1]); // +1 is so we start on "Level 1"
				this.setPosition(x, y, z);
			}
		} else if (z > this.getZ()){
			if (tile != Game.Tile.stairsDownTile){
				Game.sendMessage(this, "You can't go down here!");
			} else {
				Game.sendMessage(this, "You descend to level %d", [z + 1]); // see above
				this.setPosition(x, y, z);
			}
			
		} else if (target) {  // Can't move onto an entity
			// If we're an attacker, attack the target
			if(this.hasMixin('Attacker')){
				this.attack(target);
				return true;
			} else {
				// If not, nothing we can do, and we can't move
				// onto the tile
				return false;
			}
		}
		// Check if we can walk on the tile
		// and do so, if possible
		if (tile.isWalkable()){
			// Update the entity's position
			this.setPosition(x, y, z);
			return true;
		} else if (tile.isDiggable()) {
			map.dig(x, y, z);
			return true;
		}
		return false;
	}
};	// Movable
*/

Game.Mixins.Sight = { // Signifies that our entity posseses a field of vision in a radius
	name: 'Sight',
	groupName: 'Sight',
	init: function(template){
		this._sightRadius = template['sightRadius'] || 5;
	},
	getSightRadius: function() {
		return this._sightRadius;
	}
};


// AI Mixins - 'Actor' group
Game.Mixins.PlayerActor = {
// Main player's actor mixin
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function(){
		// Detect if the game is over
        if (this.getHp() < 1) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
        }
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously
		// for keyboard input
		this.getMap().getEngine().lock();
		// Clear the message queue
		this.clearMessages();
	}
};

Game.Mixins.FungusActor = {	// Fungus cannot move, but can spread
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

Game.Mixins.WanderActor = {
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
	if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
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
		if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
			entities[i].receiveMessage(message);
		}
	}
}; // sendMessageNearby


// Entity Repository (and one-off player template)
Game.PlayerTemplate = {
	name: 'you',
	team: 'player',
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	mixins: [
		Game.Mixins.Digger,
		Game.Mixins.Sight,
		Game.Mixins.PlayerActor,
		Game.Mixins.MessageRecipient,
		Game.Mixins.Attacker,
		Game.Mixins.Destructible]
}; // Player Template

Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	character: 'F',
	foreground: 'lime',
	maxHp: 10,
	mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}); // Fungus Template

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	maxHp: 5,
	attackValue: 4,
	mixins: [
		Game.Mixins.WanderActor,
		Game.Mixins.Attacker,
		Game.Mixins.Destructible]
}); // Bat Template

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [
		Game.Mixins.WanderActor, 
		Game.Mixins.Attacker,
		Game.Mixins.Destructible]
});

