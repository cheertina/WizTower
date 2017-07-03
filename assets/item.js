Game.Item = function(properties){
	properties = properties || {};
	// Call the glyph's constructor with our set of properties
	Game.Glyph.call(this,properties);
	//  Instantiate any properties from the passed object
	this._name = properties['name'] || '';
};

// Make items inherit all the functionality from glyphs
Game.Item.extend(Game.Glyph);

Game.Item.prototype.describe = function() {
	return this._name;
};

Game.Item.prototype.describeA = function(capital = false) {
	let prefixes = capital ? ['A', 'An'] : ['a', 'an'];
	let string = this.describe();
	let firstLetter = string.charAt(0).toLowerCase();
	// Naive solution, check for a vowel.  Doesn't handle vowel-sounding consanants
	let prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
	
	return prefixes[prefix] + ' ' + string;
};

