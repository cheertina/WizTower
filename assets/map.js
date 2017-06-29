Game.Map = function(tiles, player){
	this._tiles = tiles;
	
	// cache width and height based on the 
	// dimensions of the tiles array
	this._width = tiles.length;
	this._height = tiles[0].length;
	
	// A list to hold all the entities
	this._entities = [];
	
	// Create the engine and scheduler
	this._scheduler = new ROT.Scheduler.Simple();
	this._engine = new ROT.Engine(this._scheduler);
	
	// add the player and some random fungi
	this.addEntityAtRandomPosition(player);
	for (let i = 0; i < 1000; i++){
		this.addEntityAtRandomPosition(new Game.Entity(Game.FungusTemplate));
	}
};

// Standard getters
Game.Map.prototype.getWidth = function() { return this._width; }
Game.Map.prototype.getHeight = function() { return this._height; }
Game.Map.prototype.getEngine = function() { return this._engine; }
Game.Map.prototype.getEntities = function() { return this._entities; }

Game.Map.prototype.getEntityAt = function(x, y){
	// Look through the entity list and see
	// if any of them have the right coords
	for (let i = 0; i < this._entities.length; i++) {
		if(this._entities[i].getX() == x 
		&& this._entities[i].getY() == y){
			return this._entities[i];
		}
	}
	return false;
}


//get the tile for a given coordinate set
Game.Map.prototype.getTile = function (x, y) {
	//Make sure we're in bounds, return the null tile otherwise
	if (x < 0 || x >= this._width || y < 0 || y >= this._height){
		return Game.Tile.nullTile;
	} else {
		return this._tiles[x][y] || Game.Tile.nullTile;
	}
}

Game.Map.prototype.dig = function(x, y) {
	// If the tile is diggable, make it a floor
	if (this.getTile(x, y).isDiggable()) {
		this._tiles[x][y] = Game.Tile.floorTile;
	}
}

Game.Map.prototype.getRandomFloorPosition = function() {
	// Randomly select an empty floor tile
	let x, y;
	do{
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while(this.getTile(x, y) != Game.Tile.floorTile ||
            this.getEntityAt(x, y));
	return {x: x, y: y};
}

Game.Map.prototype.addEntity = function(entity){
	// Make sure it's in bounds
	if (entity.getX() < 0 || entity.getX() >= this._width ||
		entity.getY() < 0 || entity.getY() >= this._height) {
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
}

Game.Map.prototype.addEntityAtRandomPosition = function(entity){
	let position = this.getRandomFloorPosition();
	entity.setX(position.x);
	entity.setY(position.y);
	this.addEntity(entity);
}