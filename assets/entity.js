Game.Entity = function(properties){
	
	properties = properties || {};
	
	// Call the glyph's constructor with our set of properties
	Game.DynamicGlyph.call(this, properties);
	
	// Instantiate Entity-only properties from the passed object
	this._alive = true;
	this._speed = properties['speed'] || 1000;
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._z = properties['z'] || 0;
	this._team = properties['team'] || 'monster';
	this._map = null;
	
};	// Constructor

Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.tryMove = function(x, y, z) {
	var map = this.getMap()
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
		// Don't let things on the same team attack
		// Default to 'monster' for all non-player entities
		if(this.hasMixin('Attacker') && (this._team !== target._team)){
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
		let items = this.getMap().getItemsAt(x, y, z);
		if (items){
			if (items.length === 1){
				Game.sendMessage(this, "You see %s.", [items[0].describeA()]);
			} else {
				Game.sendMessage(this, "There are several objects here.");
			}
		}
		return true;
	}else if (tile.isDiggable() && this.hasMixin('Digger')) {
		map.dig(x, y, z);
		return true;
	}
	return false;
}; // tryMove()

Game.Entity.prototype.kill = function(message) {
	// You cannot kill that which is already dead
	if (!this._alive) {	return; } // bail out
	
	this._alive = false;
	if (message) {
		Game.sendMessage(this, message);
	} else {
		Game.sendMessage(this, "You have died!");
	}
	
	// Check if the player died, and if so call act() to prompt the user
	if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
		this.act();
	} else {
		this.getMap().removeEntity(this);
	}
};


// Getters & Setters
Game.Entity.prototype.getX     = function(){ return this._x; };
Game.Entity.prototype.getY     = function(){ return this._y; };
Game.Entity.prototype.getZ     = function(){ return this._z; };
Game.Entity.prototype.getMap   = function(){ return this._map; };
Game.Entity.prototype.getTeam  = function() {return this._team; }
Game.Entity.prototype.isAlive  = function(){ return this._alive; };
Game.Entity.prototype.getSpeed = function(){ return this._speed };
Game.Entity.prototype.getPos   = function(){ 
	return {
		x: this._x,
		y: this._y,
		z: this._z,
		str: this._x + ',' + this._y + ',' + this._z
	};
};

Game.Entity.prototype.setX        = function(x){ this._x = x; };
Game.Entity.prototype.setY        = function(y){ this._y = y; };
Game.Entity.prototype.setZ        = function(z){ this._z = z; };
Game.Entity.prototype.setMap      = function(map){ this._map = map; };
Game.Entity.prototype.setTeam	  = function(team){ this._team = team; };
Game.Entity.prototype.setSpeed    = function(){ this._speed = speed; };
Game.Entity.prototype.setPosition = function(x, y, z) {
	let oldX = this._x;
	let oldY = this._y;
	let oldZ = this._z;
	// Update position
	this._x = x;
	this._y = y;
	this._z = z;
	// If the entity is on a map, notify the map that the entity has moved.
	if (this._map) {
		this._map.updateEntityPosition(this, oldX, oldY, oldZ);
	}
}; // setPosition
