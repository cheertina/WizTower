Game.Map = function(tiles, player){
	this._tiles = tiles;
	
	// cache dimensions of the tiles array
	this._depth  = tiles.length;
	this._width  = tiles[0].length;
	this._height = tiles[0][0].length;
	
	// A hash table to hold all the entities
	this._entities = {};
	
	// Create the engine and scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	
	// Field of visions, one per floor
	this._fov = [];
	this.setupFov();
	
	// For keeping track of which tiles we've seen
	this._explored = new Array(this._depth);
	this._setupExploredArray();
	
	// Add the player
	this.addEntityAtRandomPosition(player, 0);
	
	// And some enemies
	// Do this better
	var templates = [Game.Templates.Fungus, Game.Templates.Bat, Game.Templates.Newt]
	for (let z = 0; z < this._depth; z++){
		for (let i = 0; i < 15; i++){
			let template = templates[Math.floor(Math.random() * templates.length)];
			this.addEntityAtRandomPosition(new Game.Entity(template), z);
		}
	}
	
	
}; // Constructor

// Standard getters
Game.Map.prototype.getDepth = function() { return this._depth; };
Game.Map.prototype.getWidth = function() { return this._width; };
Game.Map.prototype.getHeight = function() { return this._height; };
Game.Map.prototype.getEngine = function() { return this._engine; };
Game.Map.prototype.getEntities = function() { return this._entities; };


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
	return {x: x, y: y, z: z};
};  // getRandomFloorPosition

Game.Map.prototype.isEmptyFloor = function(x, y, z){
	return this.getTile(x, y, z) == Game.Tile.floorTile && !this.getEntityAt(x, y, z);
};

// Entity-related

Game.Map.prototype.getEntityAt = function(x, y, z){
	return this._entities[x + ',' + y + ',' + z];
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
	let key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
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
	let key = entity.getX() + ',' + entity.getY() + ',' + entity.getZ();
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



