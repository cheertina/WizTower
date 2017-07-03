Game.Entity = function(properties){
	
	properties = properties || {};
	
	// Call the glyph's constructor with our set of properties
	Game.Glyph.call(this, properties);
	
	// Instantiate any properties from the passed object
	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
	this._z = properties['z'] || 0;
	this._team = properties['team'] || 'monster';
	this._map = null;
	
	// Create an object which will keep track of the mixins
	// that are attached to this entity based on the name (of the mixin)
	this._attachedMixins = {};
	// And a similar object for mixin groups
	this._attachedMixinGroups = {};
	
	// Set up the object's mixins
	var mixins = properties['mixins'] || [];
	for (let i = 0; i < mixins.length; i++) {
		
		// From each mixin, copy over all properties except
		// the name and init properties.  We also make sure
		// not to override any properties that already exist
		for (let key in mixins[i]){
			if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
				this[key] = mixins[i][key];
			}
		}
	
		// Add the name of this mixin to our attached mixins
		this._attachedMixins[mixins[i].name] = true;
		// And add the mixin group name, too, if it exists
		if(mixins[i].groupName) {
			this._attachedMixinGroups[mixins[i].groupName] = true;
		}
		// Finally, call the init function if it exists
		if(mixins[i].init) {
			mixins[i].init.call(this, properties);
		}
	}
};	// Constructor

Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.hasMixin = function(mix){
	// Allow passing either the mixin itself or the name / group name as a string
	if (typeof mix === 'object') {
        return this._attachedMixins[mix.name];
    } else {
        return this._attachedMixins[mix] || this._attachedMixinGroups[mix];
    }
}

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

// Getters & Setters
Game.Entity.prototype.getName = function(){ return this._name; }
Game.Entity.prototype.getX    = function(){ return this._x; }
Game.Entity.prototype.getY    = function(){ return this._y; }
Game.Entity.prototype.getZ    = function(){ return this._z; }
Game.Entity.prototype.getMap  = function(){ return this._map; }
Game.Entity.prototype.getPos =  function(){ 
	return {
		x: this._x,
		y: this._y,
		z: this._z,
		str: this._x + ',' + this._y + ',' + this._z
	}
}

Game.Entity.prototype.setName = function(name){ this._name = name; }
Game.Entity.prototype.setX    = function(x){ this._x = x; }
Game.Entity.prototype.setY    = function(y){ this._y = y; }
Game.Entity.prototype.setZ    = function(z){ this._z = z; }
Game.Entity.prototype.setMap  = function(map){ this._map = map; }
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
