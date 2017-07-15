//not a graphical tile, but a class to hold information about the 
//glyph we use and other properties of a specific location on our map

Game.Tile = function(properties){
	properties = properties || {};
	// Call the Glyph constructor with our properties
	Game.Glyph.call(this, properties);
	this._name = properties['name'] || '';
	this._walkable = properties['walkable'] || false;
	this._diggable = properties['diggable'] || false;
	this._blocksLight = properties['blocksLight'] !== undefined ? properties['blocksLight'] : true;
	
};
// Make tiles inherit all the functionality from glyphs

Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.isWalkable = function(){ return this._walkable; }
Game.Tile.prototype.isDiggable = function(){ return this._diggable; }
Game.Tile.prototype.isBlockingLight = function(){ return this._blocksLight; }

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

Game.Tile.nullTile  = new Game.Tile();

Game.Tile.floorTile = new Game.Tile({
	name: 'floor',
	character: '.',
	walkable: true,
	blocksLight: false
});

Game.Tile.wallTile  = new Game.Tile({
	name: 'wall',
	character: '#',
	foreground: 'goldenrod',
	diggable: true,
	blocksLight: true
});

Game.Tile.stairsUpTile = new Game.Tile({
	name: 'stairs up',
	character: '<',
	foreground: 'white',
	walkable: true,
	blocksLight: false
});


Game.Tile.stairsDownTile = new Game.Tile({
	name: 'stairs down',
	character: '>',
	foreground: 'white',
	walkable: true,
	blocksLight: false
});


Game.Tile.altarTile = new Game.Tile({
	name: 'altar',
	character: ['0','|'],
	foreground: 'gray',
	walkable: true,
	blocksLight: false
});



