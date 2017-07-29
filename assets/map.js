Game.Map = function(tiles, player){
	this._tiles = tiles;
	
	// cache dimensions of the tiles array
	this._depth  = tiles.length;
	this._width  = tiles[0].length;
	this._height = tiles[0][0].length;
	
	// A hash table to hold all the entities
	this._entities = {};
	// And one for the items
	this._items = {};
	
	// Create the engine and scheduler
	this._scheduler = new ROT.Scheduler.Speed();
	this._engine = new ROT.Engine(this._scheduler);
	
	// Field of visions, one per floor
	this._fov = [];
	this.setupFov();
	
	// For keeping track of which tiles we've seen
	this._explored = new Array(this._depth);
	this._setupExploredArray();
	
	// Add the player
	this._player = player;	// So AI's can get it
	this.addEntityAtRandomPosition(player, 0);
    
	
	for(let floor = 0; floor < this._depth; floor++){
		for (let count = 0; count < floor+1; count++){
			let altar = this.getRandomFloorPosition(floor);
			// Fixed issue #4
			this.placeAltarAt(altar.x, altar.y, floor);
		}
	}
	
	
	// Randomly spawn and place enemies and items
	//this.simplePopulate();
	this.populate();
	
}; // Constructor

// Standard getters
Game.Map.prototype.getDepth = function() { return this._depth; };
Game.Map.prototype.getWidth = function() { return this._width; };
Game.Map.prototype.getHeight = function() { return this._height; };
Game.Map.prototype.getEngine = function() { return this._engine; };
Game.Map.prototype.getEntities = function() { return this._entities; };
Game.Map.prototype.getPlayer = function() { return this._player; };

// All chances are relative to total among all entries for a given level
// We generate a random array with 'chance' copies of each name, then pick randomly from that array


// Dungeon population and related helper functions

Game.Map.prototype.placeAltarAt = function(x, y, z){
	if(true || this.isEmptyFloor(x,y,z)){
		this._tiles[z][x][y] = new Game.Tile.altarTile();
	}
	return false;
}


// This object defines the relative chances of each monster type to be spawned on a given level

Game.Map.enemyAssign = {
	level0: [{name: 'bat', chance: 2}, {name: 'newt', chance: 2}, {name: 'kobold', chance: 1}, {name: 'fungus', chance: 5}],
	level1: [{name: 'bat', chance: 4}, {name: 'newt', chance: 4}, {name: 'kobold', chance: 2}, {name: 'fungus', chance: 2}],
	level2: [{name: 'bat', chance: 3}, {name: 'newt', chance: 3}, {name: 'kobold', chance: 3}, {name: 'fungus', chance: 1}],
	level3: [{name: 'bat', chance: 3}, {name: 'newt', chance: 3}, {name: 'kobold', chance: 4}, {name: 'fungus', chance: 1}],
	level4: [{name: 'bat', chance: 3}, {name: 'newt', chance: 3}, {name: 'kobold', chance: 5}, {name: 'fungus', chance: 1}],
	other: [{name: 'kobold', chance: 1}]
	
};


Game.Map.prototype.populate = function(){
	// Generate an array of monster names based on their relative chances (given by the enemyAssign object)
	for (let z = 0; z < this._depth; z++){	// For each floor
		let levelRndArr = [];
		let lvlStr = '';
		
		// See if we have an array for this level, or if we should use the default
		if (Game.Map.enemyAssign.hasOwnProperty('level'+z)) { lvlStr = 'level'+z; } else { lvlStr = 'other'; }
		
		// Go through each entry and put 'chance' copies of the monster name in our array
		for (let i = 0; i < Game.Map.enemyAssign[lvlStr].length; i++ ){
			let entry = Game.Map.enemyAssign[lvlStr][i];
			for (let j = 0; j < entry.chance; j++){
				levelRndArr.push(entry.name);
			}
			
			// Shuffle the array
			levelRndArr = levelRndArr.randomize();
		}
		
		// Pick 15 monster names at random from our array, and spawn them
		for (let i = 0; i < 15; i++){
			let rndNum = Math.floor(Math.random() * levelRndArr.length)
			let nameStr = levelRndArr[rndNum];
			// DEBUG console.log(rndNum, nameStr);
			this.addEntityAtRandomPosition(Game.EntityRepository.create(nameStr), z);
		}
		
		
		// some items from the list of possible random items
		for (let i = 0; i < 10; i++){
			let newItem = Game.ItemRepository.createRandom();
			this.addItemAtRandomPosition(newItem,z);
		}
		
		
		// And a spellbook on each floor
		this.addItemAtRandomPosition(Game.ItemRepository.create('spellbook'), z);
	}
	
}

Game.Map.prototype.simplePopulate = function() {
	// Put a newt spawner on the first floor, just for testing
	this.addEntityAtRandomPosition(Game.EntityRepository.create('newtNest'), 0);
	
	// And some random enemies and items
	for (let z = 0; z < this._depth; z++){
		this.addEntityAtRandomPosition(Game.EntityRepository.create('kobold'), z);
		for (let i = 0; i < 15; i++){
			
			let entity = Game.EntityRepository.createRandom()
			this.addEntityAtRandomPosition(entity, z);
			// Level up entities on lower floors
			if (entity.hasMixin('ExperienceGainer')) {
				for (let level = 0; level < z; level++) {
					entity.giveXp(entity.getNextLevelXp() - entity.getXp());
				}
			}
		}
		for (let i = 0; i < 10; i++){
			let newItem = Game.ItemRepository.createRandom();
			this.addItemAtRandomPosition(newItem,z);
		}
	}
	// Add one each of our weapons and armor
	let templates = ['dagger', 
	//	'sword', 'quarterstaff', 'tunic',
	//	'chainmail', 'platemail',
		'Staff of Energy Bolt', 'sling'];
	for (let i = 0; i < templates.length; i++){
		this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]), 0);
	}
	
};



// Tile/Location
Game.Map.prototype.getTile = function (x, y, z) {
	//Make sure we're in bounds, return the null tile otherwise
	if (x < 0 || x >= this._width 
	 || y < 0 || y >= this._height
	 || z < 0 || z >= this._depth){
		return Game.Tile.nullTile;
	} else {
		return this._tiles[z][x][y] || Game.Tile.nullTile;
	}
}; // getTile

Game.Map.prototype.dig = function(x, y, z) {
	// If the tile is diggable, make it a floor
	if (this.getTile(x, y, z).isDiggable()) {
		this._tiles[z][x][y] = Game.Tile.floorTile;
	}
};

Game.Map.prototype.getRandomFloorPosition = function(z) {
	// Randomly select an empty floor tile on the chosen floor
	let x, y;
	do{
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while(!this.isEmptyFloor(x, y, z));
	return {
		x: x,
		y: y,
		z: z,
		str: x + ',' + y + ',' + z
	};
};  // getRandomFloorPosition

Game.Map.prototype.isEmptyFloor = function(x, y, z){
	return this.getTile(x, y, z) == Game.Tile.floorTile && !this.getEntityAt(x, y, z);
};

// Items
Game.Map.prototype.getItemsAt = function(x, y, z){
	if (typeof x === 'string') { return this._items[x]; }	// call with a position string
	else { return this._items[x + ',' + y + ',' + z]; }
}

Game.Map.prototype.setItemsAt = function(x, y, z, items){
	// If our items array is empty, delete the key from the table
	let key = x + ',' + y + ',' + z;
	if (items.length === 0){
		if (this._items[key]){
			delete this._items[key];
		}
	} else {
		// Simply update the items at that key
		this._items[key] = items;
	}
}

Game.Map.prototype.addItem = function(key, item){
		
	// key = x + ',' + y + ',' + z - use getPos().str
	if (this._items[key]){
		if(item.hasMixin('Stackable')){
			for(let slot = 0; slot < this._items[key].length; slot++) {
				if (this._items[key][slot] && (this._items[key][slot]._name == item._name)){
					this._items[key][slot].incCount();
				}
			}
		}
		else {
			this._items[key].push(item);
		}
	}else this._items[key] = [item];
}

Game.Map.prototype.addItemAtRandomPosition = function(item, z){
	let pos = this.getRandomFloorPosition(z);
	this.addItem(pos.str, item);
	// DEBUG console.log(item._name + ' added at (' + pos.str + ')')
}


// Entity-related
Game.Map.prototype.getEntityAt = function(x, y, z){
	if(typeof x === 'object') { return this._entities[x.str]; }	// Almost as good as overloading
	var out = this._entities[x + ',' + y + ',' + z];
	return out;
}; // getEntityAt

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius){
	results = [];
	// Determine our bounds
	let leftX 	= centerX - radius;
	let rightX 	= centerX + radius;
	let topY 	= centerY - radius;
	let bottomY = centerY + radius;
	// Z has no range, must match exactly
	// We've deviated from the tutorial pretty significantly here
	// But if we did it right, it should still work (and should be faster)
	for (let x = leftX; x <= rightX; x++) {
		for (let y = topY; y <= bottomY; y++){
			if (this._entities.hasOwnProperty(x + ',' + y + ',' + centerZ)){
				results.push(this._entities[x + ',' + y + ',' + centerZ])
			}
		}
	}
	return results;
}; // getEntitiesWithinRadius

Game.Map.prototype.addEntity = function(entity){
	// Update the entity's map
	entity.setMap(this);
	// Add this entity to the list of entities using
	// updateEntityPosition with no previous location
	this.updateEntityPosition(entity);
	// Check if this entity is an actor, and if so
	// add them to the scheduler
	if (entity.hasMixin('Actor')){
		this._scheduler.add(entity, true);
	}
}; // addEntity

Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY, oldZ){
	// See if we passed a set of old coords, then
	// delete the old key if it's the same entity
	if (typeof oldX !== "undefined") {
		let oldKey = oldX + ',' + oldY + ',' + oldZ;
		if (this._entities[oldKey] == entity){
			delete this._entities[oldKey];
		}
	}
	// Make sure it's in bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
		entity.getY() < 0 || entity.getY() >= this._height ||
		entity.getZ() < 0 || entity.getZ() >= this._depth) {
		throw new Error('Adding entity out of bounds.');
	}
	// Make sure there's nothing there (this should already be done by the caller,
	// but trusting that is how you break shit)
	let key = entity.getPos().str;
	if (this._entities[key]) {
		throw new Error('Tried to add an entity at an occupied position')
	}
	// Add entity to the table of entities
	this._entities[key] = entity
}; // updateEntityPosition

Game.Map.prototype.addEntityAtRandomPosition = function(entity, z){
	let position = this.getRandomFloorPosition(z);
	entity.setX(position.x);
	entity.setY(position.y);
	entity.setZ(position.z)
	this.addEntity(entity);
}; // addEntityAtRandomPosition

Game.Map.prototype.removeEntity = function(entity) {
	// Remove the entity from the map
	let key = entity.getPos().str;
	if (this._entities[key] == entity) {
		delete this._entities[key];
	}
	// If the entity is an actor, remove them from the schedule
	if (entity.hasMixin('Actor')) {
		this._scheduler.remove(entity);
	}
	
}; // removeEntity

// Vision/exploration
Game.Map.prototype.setupFov = function(){
	//keep 'this' in the map variable, so we don't lose it
	var map = this;
	
	// Iterate through each depth level, seting up the FoV
	for (let z = 0; z < this._depth; z++){
		let depth = z;
		
		// For each depth we create a callback that is used to determine if light can pass through a tile
		// We use a simple yes/no function
		map._fov.push(new ROT.FOV.DiscreteShadowcasting(function(x,y) {
			return !map.getTile(x, y, depth).isBlockingLight();}, {topology:8}));
	}
};

Game.Map.prototype.getFov = function(depth){ return this._fov[depth]; };

Game.Map.prototype._setupExploredArray = function() {
	
	for (let z = 0; z < this._depth; z++){
		
		this._explored[z] = new Array(this._width);
		for (let x = 0; x < this._width; x++){
			
			this._explored[z][x] = new Array(this.height);
			for (let y = 0; y < this._height; y++){
				// Start all cells as unseen
				this._explored[z][x][y] = false;
			}
		}
	}
}; //_setupExploredArray()

Game.Map.prototype.setExplored = function(x, y, z, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y, z) !== Game.Tile.nullTile) {
        this._explored[z][x][y] = state;
    }
};

Game.Map.prototype.isExplored = function(x, y, z) {
    // Only return the value if within bounds
    if (this.getTile(x, y, z) !== Game.Tile.nullTile) {
        return this._explored[z][x][y];
    } else {
        return false;
    }
};




