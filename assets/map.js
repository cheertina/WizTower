Game.Map = function(tiles){
	this._tiles = tiles;
	
	// cache width and height based on the 
	// dimensions of the tiles array
	
	this._width = tiles.length;
	this._height = tiles[0].length;
};

// Standard getters
Game.Map.prototype.getWidth = function() { return this._width; };
Game.Map.prototype.getHeight = function() { return this._height; };

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
	// Randomly select a floor tile
	let x, y;
	do{
		x = Math.floor(Math.random() * this._width);
		y = Math.floor(Math.random() * this._height);
	} while(this.getTile(x, y) != Game.Tile.floorTile);
	return {x: x, y: y};
}