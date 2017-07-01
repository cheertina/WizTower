//not a graphical tile, but a clas to hold information about the 
//glyph we use and other properties of a specific location on our map

Game.Tile = function(properties){
	properties = properties || {};
	// Call the Glyph constructor with our properties
	Game.Glyph.call(this, properties);
	this._isWalkable = properties['isWalkable'] || false;
	this._isDiggable = properties['isDiggable'] || false;
	
};
// Make tiles inherit all the functionality from glyphs

Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.isWalkable = function(){ return this._isWalkable; }
Game.Tile.prototype.isDiggable = function(){ return this._isDiggable; }

// Helper function
Game.getNeighborPositions = function(x, y) {
	let tiles = [];
	// Generate all possible offsets
	for (var dX = -1; dX < 2; dX++){
		for (var dY = -1; dY < 2; dY++){
			if(dX == 0 && dY == 0){
				continue;
			}
			tiles.push({x: x + dX, y: y + dY});
		}
	}
	return tiles.randomize();
}

// Tile Definitions

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

Game.Tile.stairsUpTile = new Game.Tile({
	character: '<',
	foreground: 'white',
	isWalkable: true
});

Game.Tile.stairsDownTile = new Game.Tile({
	character: '>',
	foreground: 'white',
	isWalkable: true
});

