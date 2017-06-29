Game.Entity = function(properties){
	
	properties = properties || {};
	
	// Call the glyph's constructor with our set of properties
	Game.Glyph.call(this, properties);
	
	// Instantiate any properties from the passed object
	this._name = properties['name'] || '';
	this._x = properties['x'] || 0;
	this._y = properties['y'] || 0;
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
		for (var key in mixins[i]){
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

// Getters & Setters
Game.Entity.prototype.setName = function(name){ this._name = name; }
Game.Entity.prototype.setX    = function(x){ this._x = x; }
Game.Entity.prototype.setY    = function(y){ this._y = y; }
Game.Entity.prototype.setMap  = function(map){ this._map = map; }

Game.Entity.prototype.getName = function(){ return this._name; }
Game.Entity.prototype.getX    = function(){ return this._x; }
Game.Entity.prototype.getY    = function(){ return this._y; }
Game.Entity.prototype.getMap  = function(){ return this._map; }

