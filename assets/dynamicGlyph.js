Game.DynamicGlyph = function(properties){
	
	properties = properties || {};
	
	// Call the glyph's constructor with our set of properties
	// This constructor handles the following properties:
	// character
	// foreground color
	// background color
	Game.Glyph.call(this, properties);
	
	// Instantiate properties from the passed object
	this._name = properties['name'] || '';
	
	// Create an object which will keep track of the mixins
	// that are attached to this entity based on the name (of the mixin)
	this._attachedMixins = {};
	
	// And a similar object for mixin groups
	this._attachedMixinGroups = {};
	
	// Set up the object's mixins
	var mixins = properties['mixins'] || [];
	// DEBUG console.log(this.getName() + " mixins: " + JSON.stringify(mixins));
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

Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.addMixin = function(mix){
	for (let key in mix){
		if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
			this[key] = mix[key];
		}
	}
	// Add the name of this mixin to our attached mixins
	this._attachedMixins[mix.name] = true;
	// And add the mixin group name, too, if it exists
	if(mix.groupName) {
		this._attachedMixinGroups[mix.groupName] = true;
	}
	// Finally, call the init function if it exists
	if(mix.init) {
		mix.init.call(this, properties);
	}
}

Game.DynamicGlyph.prototype.removeMixin = function(mix){
	for (let key in mix){
		if (key != 'init' && key != 'name' && this.hasOwnProperty(key)) {
			delete this[key];
		}
		delete this._attachedMixins[mix.name];
		
		// IF this is the last mixin of a group, delete the group
		// note we already deleted this specific mixin, so just check the rest
		let groupFlag = false;
		for (let groupKey in this._attachedMixins){
			if (this._attachedMixins[groupKey].groupName = mix.groupName){
				groupFlag = true;
				break;
			}
		}
		if (groupFlag) {
			delete this._attachedMixinGroups[mix.groupName];
		}
		
		if(mix.onRemove){
			mix.onRemove.call(this);
		}
	}
}

Game.DynamicGlyph.prototype.hasMixin = function(mix){
	// Allow passing either the mixin itself or the name / group name as a string
	if (typeof mix === 'object') {
        return this._attachedMixins[mix.name];
    } else {
        return this._attachedMixins[mix] || this._attachedMixinGroups[mix];
    }
};

Game.DynamicGlyph.prototype.getName = function(){ return this._name; }
Game.DynamicGlyph.prototype.setName = function(name){ this._name = name; }

// Description variants

Game.DynamicGlyph.prototype.describe = function() {
	// DEBUG console.log('dynamicGlyph:108');
	// DEBUG console.log(vsprintf("%s.hasMixin('Stackable')", "%s._stackCount", [this.getName(), this.getName()]));
	// DEBUG console.log(this.hasMixin('Stackable'), (this._stackCount || "non-stack"));
	if (this.hasMixin('Stackable') && this._stackCount > 1){
		return vsprintf("pile of %d %ss", [this._stackCount, this._name]);
	}
		return this._name;
};

Game.DynamicGlyph.prototype.describeA = function(capital = false) {
	let prefixes = capital ? ['A', 'An'] : ['a', 'an'];
	let string = this.describe();
	let firstLetter = string.charAt(0).toLowerCase();
	// Naive solution, check for a vowel.  Doesn't handle vowel-sounding consanants
	let prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
	
	return prefixes[prefix] + ' ' + string;
};

Game.DynamicGlyph.prototype.describeThe = function (capital = false) {
	let prefix = capital ? 'The' : 'the';
	return prefix + ' ' + this.describe();
}

