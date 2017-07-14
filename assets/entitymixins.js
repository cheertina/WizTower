// Create our EntityMixins namespace
Game.EntityMixins = {};


// Generic Mixins
Game.EntityMixins.Attacker = { // Entity can attack and cause damage
	name: 'Attacker',
	groupName: 'Attacker',
	init: function(template){
		this._attackValue = template['attackValue'] || 1;
	},
	getAttackValue: function(){
		let modifier = 0;
		// Take weapons/armor into consideration, if neccessary
		if (this.hasMixin(Game.EntityMixins.Equipper)) {
			if (this.getArmor()) { modifier += this.getArmor().getAttackValue() }
			if (this.getWeapon()) { modifier += this.getWeapon().getAttackValue() }
			if (this.getRangedWeapon()) { modifier += this.getRangedWeapon().getAttackValue() }
		}
		return this._attackValue + modifier;
	},
	getRangedAttackValue: function(){
		let modifier = 0;
		// Take weapons/armor into consideration, if neccessary
		if (this.hasMixin(Game.EntityMixins.Equipper)) {
			if (this.getArmor()) { modifier += this.getArmor().getRangedAttackValue() }
			if (this.getWeapon()) { modifier += this.getWeapon().getRangedAttackValue() }
			if (this.getRangedWeapon()) { modifier += this.getRangedWeapon().getRangedAttackValue() }
		}
		return this._attackValue + modifier;
	},
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
	},
	rangedAttack: function(target, ammoSlot = -1){ 
		// For now, we're ignoring entities between the attacker and the target
		// When/if we decide to handle that, it may be here, it may be in the targeting UI section
		if(target.hasMixin('Destructible')){
			let attack = this.getRangedAttackValue();
			let defense = target.getDefenseValue();
			let max = Math.max(0, attack - defense);
			let damage = 1 + Math.floor(Math.random() * max);
			
			Game.sendMessage(this, 'You shoot the %s for %d damage!', [target.getName(), damage]);
			Game.sendMessage(target, 'The %s shoots you for %d damage', [this.getName(), damage]);
			
			target.takeDamage(this, damage);
			let ammo = null;
			if(ammoSlot >= 0 ) { 
				ammo = this.removeItem(ammoSlot);
				console.log(JSON.stringify(ammo));
			}
		}
	},
	increaseAttackValue: function(value){
		// If no value was passed, default to +2
		value = value || 2;
		// Add it to the current Attack VAlue
		this._attackValue += value;
		Game.sendMessage(this, "You feel stronger!");
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
	getDefenseValue: function(){
		let modifier = 0;
		// Take weapons/armor into consideration, if neccessary
		if (this.hasMixin(Game.EntityMixins.Equipper)) {
			if (this.getWeapon()) { modifier += this.getWeapon().getDefenseValue() }
			if (this.getArmor()) { modifier += this.getArmor().getDefenseValue() }
		}
		return this._defenseValue + modifier;
	},
	takeDamage: function(attacker, damage) {
		this._hp -= damage;
		// If hp drops to 0 or less, remove ourselves from the map via Game.Entity.kill()
		if (this._hp <= 0){
			Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
			// DEBUG console.log(attacker.getName() + " kills " + this.getName());
			// Drop a corpse, if necessary
			if (this.hasMixin(Game.EntityMixins.CorpseDropper)) {
				this.tryDropCorpse();
			}
            this.kill();
			if(attacker.hasMixin('ExperienceGainer')){
				let exp = this.getMaxHp() + this.getDefenseValue();
				if (this.hasMixin('Attacker')) { exp += this.getAttackValue(); }
				if (this.hasMixin('ExperienceGainer')) { exp -= (attacker.getLevel() - this.getLevel()) * 3;}
				if (exp > 0) { attacker.giveXp(exp); }
			}
		}
	},
	heal: function(healVal){  // healVal can be negative for non-attack damage (starving, poison, etc.)
		healVal = healVal || 1;
		this._hp = Math.min(this._hp + healVal, this._maxHp);
		if (this._hp <= 0){
			Game.sendMessage(this, 'You died!');
			if (this.hasMixin(Game.EntityMixins.CorpseDropper)) {
				this.tryDropCorpse();
			}
            this.kill();
		}
	},
	increaseDefenseValue: function(value){
		value = value || 2;
		this._defenseValue += value;
		Game.sendMessage(this, "You feel tougher!");
	},
	increaseMaxHp: function(value) {
		value = value || 10;
		this._maxHp += value;
		this.heal(value);
		Game.sendMessage(this, "You feel healthier!");
	}
}; //Destructible

Game.EntityMixins.Spawner = { // Entity can create entities of the same or different type
	name: 'Spawner',
	init: function(template){
		// _spawns is an array of entity template _name strings_
		// should probably refactor into an object with options and chances, to allow non-equal spreads of 
		// spawn types
		this._spawns = template['spawns'] || [template['name', 1]];	// Default to self-replication, fungus-style
		this._spawnsLeft = template['maxSpawns'] || -1;	//-1 for unlimited
	},
	spawn: function(){
		if(this._spawnsLeft == 0){ return; }  // No spawns left, bail out
		
		// Generate a random dX and dY of -1, 0, or 1
		let xOffset = 0;
		let yOffset = 0;
		while (xOffset == 0 && yOffset == 0){	// Generate random offsets until we're not hitting our starting location
			xOffset = Math.floor(Math.random() * 3) - 1;
			yOffset = Math.floor(Math.random() * 3) - 1;
		}
		
		target = {x: this.getX() + xOffset,
				  y: this.getY() + yOffset,
				  z: this.getZ()
		}
		// Select a creature to spawn at random from the list of availabe spawn types
		// TODO: Rework this to allow possibly non-uniform distributions?
		// Fake it with multiple entries in the array ([a,a,a,b] for 75/25)
		let rngSpawn = Math.floor(Math.random() * this._spawns.length);
		let newSpawn = this._spawns[rngSpawn];
		
		// For now, attempting to create a spawn on a non-empty square just fails (but doesn't cost a spawn)
		// Create the spawned creature and put it on the floor at the offset location if it's empty
		if (this.getMap().isEmptyFloor(target.x, target.y, target.z)){
			let entity = Game.EntityRepository.create(newSpawn);
			entity.setPosition(target.x, target.y, target.z);
			this.getMap().addEntity(entity);
			this._growthsRemaining--;
			
			// Send a message to nearby entities
			Game.sendMessageNearby(this.getMap(),
				entity.getX(), entity.getY(), entity.getZ(),
				'A new ' + newSpawn + ' has spawned!');
				
			if (this._spawnsLeft > 0){	// If it hits zero, we stop spawning.  If it's negative to start
				this._spawnsLeft--;		// we just keep going forever.
			}
		}
	
	}
};

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
	},
	canSee: function(entity) {
		// If not on the same map and floor, no need to continue
		if(!entity || this._map !== entity.getMap() || this._z !== entity.getZ()) {
			return false;
		}
		
		let targetX = entity.getX();
		let targetY = entity.getY();
		
		
		// If we're not within sight radius (pythagorean), no point
		if ((targetX - this._x) * (targetX - this._x) +
			(targetY - this._y) * (targetY - this._y) > 
			(this._sightRadius * this._sightRadius)) {
			return false;
		}
		
		// Compute an actual FOV and check
		let found = false;
		this.getMap().getFov(this.getZ()).compute(
			this.getX(), this.getY(),
			this.getSightRadius(),
			function(x, y, radius, visibility) {
				if (x === targetX && y === targetY) {
					found = true;
				}
			});
		return found;
	},
	increaseSightRadius: function(value){
		value = value || 1;
		this._sightRadius += value;
		Game.sendMessage(this, "You become more aware of your surroundings!")
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
			// Take damage equal to how negative your fullness is
			this.heal(this._fullness);
			Game.sendMessage(this, "You are starving!");
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

Game.EntityMixins.CorpseDropper = { // Entity can drop a corpse when killed
	name: 'CorpseDropper',
	init: function(template) {
		// % chance to drop corpse
		this._corpseDropRate = template['corpseDropRate'] || 100;
	},
	tryDropCorpse: function() {
		if (Math.round(Math.random() * 100) < this._corpseDropRate) {
			// Create a new corpse item and drop it
			this._map.addItem(this.getPos().str, 
				Game.ItemRepository.create('corpse', {
					name: this._name + ' corpse',
					foreground: this._foreground
				}));
		}
	}
}


// XP, Levels, and Stats
Game.EntityMixins.ExperienceGainer = {
	name: 'ExperienceGainer',
	init: function(template){
		this._level = template['level'] || 1;
		this._xp = template['xp'] || 0;
		this._statPointsPerLevel = template['statPointsPerLevel'] || 1;
		this._statPoints = 0;
		// Determine what stats can be leveled up
		this._statOptions = [];
		if (this.hasMixin('Attacker')) {
			this._statOptions.push(['Increase attack value', this.increaseAttackValue]); 
		}
		if (this.hasMixin('Destructible')) { 
			this._statOptions.push(['Increase defense value', this.increaseDefenseValue]);
			this._statOptions.push(['Increase maximum health', this.increaseMaxHp]); 
		}
		if (this.hasMixin('Sight')) {
			this._statOptions.push(['Increase sight radius', this.increaseSightRadius]);
		}
	},
	getLevel: function(){ return this._level; },
	getXp: function(){ return this._xp; },
	getNextLevelXp: function(){ return 10 * (this._level * this._level); },		//10, 40, 90, 160...
	getStatPoints: function(){ return this._statPoints; },
	setStatPoints: function(value) { this._statPoints = value; },
	getStatOptions: function() { return this._statOptions; },
	giveXp: function(points) {
		let statPointsGained = 0;
		let levelsGained = false;
		
		this._xp += points;
		while (this._xp > this.getNextLevelXp()){
			this._xp -= this.getNextLevelXp();
			this._level++;
			levelsGained = true;
			this._statPoints += this._statPointsPerLevel;
			statPointsGained += this._statPointsPerLevel;
		}
		// If we gained any levels
		if(levelsGained) {
			Game.sendMessage(this, "You advance to level %d.", [this._level]);
			// Heal the entity, if possible
			if (this.hasMixin('Destructible')) { this.heal(this._maxHp); }
			if (this.hasMixin('StatGainer')) {
				this.onGainLevel();
			}
		}
	}
};

Game.EntityMixins.RandomStatGainer = {
	name: 'RandomStatGainer',
	groupName: 'StatGainer',
	onGainLevel: function(){
		let statOptions = this.getStatOptions();
		while (this.getStatPoints() > 0){
			statOptions.random()[1].call(this);
			this.setStatPoints(this.getStatPoints() - 1);
		}
	}
};

Game.EntityMixins.PlayerStatGainer = {
	name: 'PlayerStatGainer',
	groupName: 'StatGainer',
	onGainLevel: function(){
		Game.Screen.gainStatScreen.setup(this);
		Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
	}
};

// Magic-related
Game.EntityMixins.MagicUser = {
	name: 'MagicUser',
	init: function(template){
		// copy values from template or set defaults
		_mana = template['mana'] || {
			white: 0,
			black: 0,
			green: 0,
			blue:  0,
			red:   0
		};
		_maxMana = template['maxMana'] || {
			white: 0,
			black: 0,
			green: 0,
			blue:  0,
			red:   0
		};
		
		_spells = [];
	}
};



// Item-related
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
		if(item.hasMixin('Stackable')){
			// DEBUG console.log("entitymixins.js 408 in addItem() with stackable");
			// DEBUG console.log("this._items = " + JSON.stringify(this._items));
			
			// See if there's a stack to add it to
			for(let slot = 0; slot < this._items.length; slot++) {
				
				/*\
				|*|  console.log("this._items["+slot+"] = " + JSON.stringify(this._items[slot]));
				|*|  console.log(this._items[slot]);
				|*|  if(this._items[slot]) {
				|*|  	console.log(this._items[slot]._name + ' == ' + item._name+': '+ (this._items[slot]._name == item._name));
				|*|  }
				\*/
				
				
				
				
				
				if (this._items[slot] && (this._items[slot]._name == item._name)){
					let leftovers = this._items[slot].incCount(item._stackCount);
					if(!leftovers) { return true; }
				}
			}
		}
		// Find an empty slot, or return false if we can't add the item
		for(let slot = 0; slot < this._items.length; slot++) {
			if (!this._items[slot]) {
				this._items[slot] = item;
				return true;
			}
		}
		return false;
	},
	removeItem: function(slot, all=false){
		let removedItem = null;
		if(this._items[slot].hasMixin('Stackable') && !all ){
			removedItem = Game.ItemRepository.create(this._items[slot].getName(), {stackCount: 1});
			let remaining = this._items[slot].decCount();
			if (remaining == 0) {
				this._items[slot] = null;
			}
		}else{
			if (this._items[slot] && this.hasMixin('Equipper')) { this.unequip(this._items[slot]); }
			removedItem = this._items[slot];
			this._items[slot] = null;
		}
		
		
		return removedItem;
	},
	canAddItem: function(item) {
		// First check if there's room for one in a stack we already have
		if(item.hasMixin('Stackable')){ 
			for(let slot = 0; slot < this._items.length; slot++) {
				if ( (this._items[slot].getName() == item.getName) && 
					 (this._items[slot]._stackCount < this._items[slot].stackSize) ) {
					return true;
				}
			}
			
		}
		// Then find an empty slot
		for(let slot = 0; slot < this._items.length; slot++) {
			if (!this._items[slot]) {
				return true;
			}
		}
		// Return false if we can't add the item
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
			this._map.addItem(this.getPos().str, this._items[slot]);
			this.removeItem(slot);
		}
	}
};

Game.EntityMixins.Equipper = {
	name: 'Equipper',
	init: function(template){
		// For now, one weapon and one armor
		this._weapon = null;
		this._rangedWeapon = null;
		this._armor = null;
	},
	wield: function(item){ 
		if(item.isRanged()){
			this._rangedWeapon = item;
		} else {
			this._weapon = item;
		}
	},
	unwield: function(){ this._weapon = null; },
	unwieldRanged: function() { this._rangedWeapon = null; },
	wear: function(item){ this._armor = item; },
	unwear: function(item){ this._armor = null; },
	getWeapon: function() { return this._weapon; },
	getRangedWeapon: function() { return this._rangedWeapon; },
	getArmor: function (){ return this._armor; },
	getAmmoSlot: function() { 
		// Find the item that represents the ammo for our current ranged weapon
		let ammoType = this._rangedWeapon.getAmmoType();
		if (ammoType == 'magic') { return -2; }
		// If there is one, and this creature has an inventory, find the index
		// of the first stack in the inventory array that holds this type
		if(ammoType && this.hasMixin('InventoryHolder')) { 
			for (let i = 0; i < this._items.length; i++){
				if (this._items[i].getName() == ammoType){
					return i;
				}
			}
			return -1;
		}
	},
	unequip: function(item){
		// Generic/helper function to call before getting rid of an item (dropping, destroying, etc.)
		if (this._rangedWeapon === item) { this.unwieldRanged(); }
		if (this._weapon === item) { this.unwield(); }
		if (this._armor === item) { this.unwear(); }
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

Game.EntityMixins.TurnSpawnActor = {
	name: 'TurnSpawnActor',
	groupName: 'Actor',
	init: function(template)	{
		this._spawnRate = template['spawnRate'] || 10;	// Turns between spawns
		this._turnCounter = 0;
	},
	act: function(){
		if (this._spawnRate < 1) this._spawnRate = 1;	// In case we ever let this change and get below 1 somehow
		if (this._turnCounter == this._spawnRate){
			this.spawn();
			
		}
		this._turnCounter++;
		while (this._turnCounter > this._spawnRate){ this._turnCounter -= this._spawnRate; }
	}
	
}

Game.EntityMixins.RngSpawnActor = {	// For rng-based spawn rate
	name: 'RngSpawnActor',
	groupName: 'Actor',
	init: function(template){ 
		this._spawnChance = template['spawnChance'] || .02
	},
	act: function(){
		if(Math.random() <= this._spawnChance){ // 2% chance to spread
			this.spawn();
		}
	} //act()
};

Game.EntityMixins.TaskActor = {		// Perform task, or wander
	name: 'TaskActor',
	groupName: 'Actor',
	init: function(template){
		// Load tasks
		this._tasks = template['tasks'] || ['wander'];
	},
	act: function(){
		// Prioritize tasks until one can be acted on
		// We factored out the pre-test.  Now we attempt the action and return false
		// if it is impossible - no targets in range, whatever.  Keep trying in order until something succeeds
		// Wander will always return true;
		for (let i = 0; i < this._tasks.length; i++){
			let success = this[this._tasks[i]]();
			if (success) { return; }
		}
	},
	hunt: function(priorities){
		// Set up defaults, if necessary
		priorities = priorities || {high: ['player'], low: ['neutral']}
		
		// Prepare empty lists to fill with targets
		let targets = [];
		let subTargets = []
		let target = null;
		
		// Simplify calls and make sure we don't lose context
		let map = this.getMap();
		let myLoc = this.getPos();
		
		map.getFov(myLoc.z).compute(myLoc.x, myLoc.y, this.getSightRadius(),
			function(x, y, radius, visibility) { // Callback function, called on each visible (x,y) pair in radius
				let chk = map.getEntityAt(x, y, myLoc.z)
				if(chk && (x !== myLoc.x || y !== myLoc.y)){ // if there's a creature and it's not the one searching
					// See if this entities team is on the high priority list
					for (var prioIndex = 0; prioIndex < priorities.high.length; prioIndex++){
						if(chk.getTeam() == priorities.high[prioIndex]) { 
							targets.push(chk.getPos());
						}
					}
					// See if it's on the low priority list
					for (prioIndex = 0; prioIndex < priorities.low.length; prioIndex++){
						if(chk.getTeam() == priorities.low[prioIndex]) { 
							subTargets.push(chk.getPos());
						}
					}					
				}
		});
		// So now we should have 2 lists of positions in visual radius with targets
		
		
		if (targets.length) { target = map.getEntityAt(targets[0]); }
		else if (subTargets.length) { target = map.getEntityAt(subTargets[0]); }
		
		// DEBUG if(target) console.log("Found (sub)target: " + target.getName());
		else return false;	// No target found, move on to next priority action
		
		// Generate the path and move to the first tile
		// Using ROT.js's A* pathfinder
		let source = this;
		let z = source.getZ();
		let path = new ROT.Path.AStar(target.getX(), target.getY(), function(x, y) {
			// if an entity is present at the tile, can't move there
			let entity = source.getMap().getEntityAt(x,y,z);
			if (entity && entity !== target && entity !== source){
				return false;
			}
			return source.getMap().getTile(x,y,z).isWalkable();
		}, {topology: 8});
		// Once we have the path, move to the second cell passed in the callback
		// The first one is our entity starting point
		let count = 0;
		path.compute(source.getX(), source.getY(), function(x,y) {
			if (count == 1) {
				source.tryMove(x,y,z);
			}
			count++;
		});
		return true;
		
	},
	
	wander: function(){
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
		return true;
	}
}

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

