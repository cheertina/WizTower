Game.Map = function(tiles, player){
	this._tiles = tiles;
	
	// cache dimensions of the tiles array
	this._depth  = tiles.length;
	this._width  = tiles[0].length;
	this._height = tiles[0][0].length;
	
	// A list to hold all the entities
	this._entities = [];
	
	// Create the engine and scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	
	// Field of visions, one per floor
	this._fov = [];
	this.setupFov();
	
	
	// add the player and some random fungi on each floor
	this.addEntityAtRandomPosition(player, 0);
	for (let z = 0; z < this._depth; z++){
		for (let i = 0; i < 25; i++){
			this.addEntityAtRandomPosition(new Game.Entity(Game.Templates.Fungus), z);
		}
	}
	
	
	
} // Constructor

// Standard getters
Game.Map.prototype.getDepth = function() { return this._depth; }
Game.Map.prototype.getWidth = function() { return this._width; }
Game.Map.prototype.getHeight = function() { return this._height; }
Game.Map.prototype.getEngine = function() { return this._engine; }
Game.Map.prototype.getEntities = function() { return this._entities; }

Game.Map.prototype.getEntityAt = function(x, y, z){
	// Look through the entity list and see
	// if any of them have the right coords
	for (let i = 0; i < this._entities.length; i++) {
		if(this._entities[i].getX() == x 
		&& this._entities[i].getY() == y
		&& this._entities[i].getZ() == z){
			return this._entities[i];
		}
	}
	return false;
} // getEntityAt

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, centerZ, radius){
	results = [];
	// Determine our bounds
	let leftX 	= centerX - radius;
	let rightX 	= centerX + radius;
	let topY 	= centerY - radius;
	let bottomY = centerY + radius;
	// Z has no range, must match exactly
	for (let i = 0; i < this._entities.length; i++) {
		if (this._entities[i].getX() >= leftX 	&&
			this._entities[i].getX() <= rightX 	&&
		    this._entities[i].getY() >= topY 	&&
		    this._entities[i].getY() <= bottomY &&
			this._entities[i].getZ() == centerZ) {
			results.push(this._entities[i]);
		}
	}
	return results;
} // getEntitiesWithinRadius

//get the tile for a given coordinate set
Game.Map.prototype.getTile = function (x, y, z) {
	//Make sure we're in bounds, return the null tile otherwise
	if (x < 0 || x >= this._width 
	 || y < 0 || y >= this._height
	 || z < 0 || z >= this._depth){
		return Game.Tile.nullTile;
	} else {
		return this._tiles[z][x][y] || Game.Tile.nullTile;
	}
} // getTile

Game.Map.prototype.dig = function(x, y, z) {
	// If the tile is diggable, make it a floor
	if (this.getTile(x, y, z).isDiggable()) {
		this._tiles[z][x][y] = Game.Tile.floorTile;
	}
}

Game.Map.prototype.getRandomFloorPosition = function(z) {
	// Randomly select an empty floor tile on the chosen floor
	let x, y;
	do{
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while(!this.isEmptyFloor(x, y, z));
	return {x: x, y: y, z: z};
}  // getRandomFloorPosition

Game.Map.prototype.isEmptyFloor = function(x, y, z){
	return this.getTile(x, y, z) == Game.Tile.floorTile && !this.getEntityAt(x, y, z);
}

Game.Map.prototype.addEntity = function(entity){
	// Make sure it's in bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
		entity.getY() < 0 || entity.getY() >= this._height ||
		entity.getZ() < 0 || entity.getZ() >= this._depth) {
		throw new Error('Adding entity out of bounds.');
	}
	// Update the entity's map
	entity.setMap(this);
	// Add this entity to the list of entities
	this._entities.push(entity);
	// Check if this entity is an actor, and if so
	// add them to the scheduler
	if (entity.hasMixin('Actor')){
		this._scheduler.add(entity, true);
	}
} // addEntity

Game.Map.prototype.addEntityAtRandomPosition = function(entity, z){
	let position = this.getRandomFloorPosition(z);
	entity.setX(position.x);
	entity.setY(position.y);
	entity.setZ(position.z)
	this.addEntity(entity);
} // addEntityAtRandomPosition

Game.Map.prototype.removeEntity = function(entity) {
	// Find the entity in the list of entities if it is present
	for (let i = 0; i < this._entities.length; i++){
		if (this._entities[i] == entity){
			this._entities.splice(i,1);
			break;
		}
	}
	// If the entity is an actor, remove them from the schedule
	if (entity.hasMixin('Actor')) {
		this._scheduler.remove(entity);
	}
	
} // removeEntity

Game.Map.prototype.setupFov = function(){
	//keep 'this' in the map variable, so we don't lose it
	var map = this;
	
	// Iterate through each depth level, seting up the FoV
	for (let z = 0; z < this._depth; z++){
		let depth = z;
		map._fov.push(new ROT.FOV.DiscreteShadowcasting(function(x,y) {
			return !map.getTile(x, y, depth).isBlockingLight();}, {topology:8}));
	}
}

Game.Map.prototype.getFov = function(depth){ return this._fov[depth]; }

