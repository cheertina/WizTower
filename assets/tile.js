//not a graphical tile, but a clas to hold information about the 
//glyph we use and other properties of a specific location on our map

Game.Tile = function(properties){
	properties = properties || {};
	// Call the Glyph constructor with our properties
	Game.glyph.call(this, properties);
	this._isWalkable = properties['isWalkable'] || false;
	this._isDiggable = properties['isDiggable'] || false;
	
};
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.glyph);

Game.Tile.prototype.isWalkable = function(){ return this._isWalkable; }
Game.Tile.prototype.isDiggable = function(){ return this._isDiggable; }

Game.Tile.nullTile  = new Game.Tile( {} );
Game.Tile.floorTile = new Game.Tile({
	character: '.',
	isWalkable: true
});
Game.Tile.wallTile  = new Game.Tile({
	character: '#',
	foreground: 'goldenrod',
	isDiggable: true
});