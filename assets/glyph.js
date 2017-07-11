Game.Glyph = function(properties) {
	// fill in default values if necessary
	properties = properties || {}
	this._char 		 = properties['character'] || ' ';
	this._foreground = properties['foreground'] || 'white';
	this._background = properties['background'] || 'black';
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function(){
	let out = this._char;
	if (!Array.isArray(out)) { out = [out]; }
	// We want to return the character as an array.
	// The draw function overlaps all characters in an array
	// This is how we draw the cursor ('_') on the same space as another thing
	// It also lets us make fancy glyphs, like our bow glyph
	return out;
	
};
Game.Glyph.prototype.getBackground = function(){
	return this._background;
};
Game.Glyph.prototype.getForeground = function(){
	return this._foreground;
};