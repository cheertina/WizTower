Game.Builder = function(width, height, depth){
	this._width = width;
	this._height = height;
	this._depth = depth;
	this._tiles = new Array(depth);
	this._regions = new Array(depth);
	
	// Insantiate the arrays to be multi-dimensional
	for (let z = 0; z < depth; z++){
		// Create a new cave at each level
		this._tiles[z] = this._generateLevel();
		
		// Setup the regions array for each depth
		this._regions[z] = new Array(width);
		for (let x = 0; x < width; x++){
			this._regions[z][x] = new Array(height);
			// Fill with zeroes
			for (let y = 0; y < height; y++){
				this._regions[z][x][y] = 0;
			}
		}
	}
	for (let z = 0; z < this._depth; z++){
		this._setupRegions(z);
	}
	this._connectAllRegions();
	
};

// Getters

Game.Builder.prototype.getTiles  = function() { return this._tiles; }
Game.Builder.prototype.getDepth  = function() { return this._depth; }
Game.Builder.prototype.getWidth  = function() { return this._width; }
Game.Builder.prototype.getHeight = function() { return this._height; }


// Level-building helper functions

Game.Builder.prototype._generateLevel = function() {
	// Create the empty map
	var map = new Array(this._width);
	for (let w = 0; w < this._width; w++){
		map[w] = new Array(this._height);
	}
	
	// Setup the cave generator
	var generator = new ROT.Map.Cellular(this._width, this._height);
	generator.randomize(0.5);
	var totalIterations = 3;
	
	// Iteratively smooth the map
	for (let i = 0; i < totalIterations - 1; i++){
		generator.create();
	}
	// Smooth it one more time and then update the map
	generator.create(function(x,y,v){
		if(v === 1){
			map[x][y] = Game.Tile.floorTile;
		}else{
			map[x][y] = Game.Tile.wallTile;
		}
	});
	return map;
	
} // _generateLevel()

Game.Builder.prototype._canFillRegion = function(x, y, z){
	// Make sure the tile is in bounds
	if (x < 0 || x >= this._width ||
		y < 0 || y >= this._height ||
		z < 0 || z >= this._depth){
		return false;
	}
	// Make sure it doesn't already have a region
	if (this._regions[z][x][y] != 0){
		return false;
	}
	// Make sure the tile is walkable
	return this._tiles[z][x][y].isWalkable();
	
} // _canFillRegion()

Game.Builder.prototype._fillRegion = function (region, x, y, z){
	// Flood fill a region with a number, return the number of tiles filled
	var tilesFilled = 1;
	var tiles = [{x:x, y:y}];
	var tile;
	var neighbors;
	
	// Update the region of the original tile
	this._regions[z][x][y] = region;
	// Keep looping while we still have tiles to process
	while (tiles.length > 0){
		tile = tiles.pop();
		// Get the neighbors of the tile
		neighbors = Game.getNeighborPositions(tile.x, tile.y);
		
		// Check each neighbor to see if we can use it to fill
		// and if so, update the region and add it to our processing list
		while (neighbors.length > 0){
			tile = neighbors.pop();
			if (this._canFillRegion(tile.x, tile.y, z)){
				this._regions[z][tile.x][tile.y] = region;
				tiles.push(tile);
				tilesFilled++;
			}
		}
	}
	return tilesFilled;
	
} // _fillRegion

Game.Builder.prototype._removeRegion = function(region, z){
	for (let x = 0; x < this._width; x++){
		for (let y = 0; y < this._height; y++){
			if(this._regions[z][x][y] == region){
				// Clear the region and set the tile to a wall
				this._regions[z][x][y] = 0;
				this._tiles[z][x][y] = Game.Tile.wallTile;
			}
		}
	}
} // _removeRegion()

Game.Builder.prototype._setupRegions = function(z){
	var region = 1;
	var tilesFilled;
	//Find a starting tile for a flood fill
	for (let x = 0; x < this._width; x++){
		for (let y = 0; y < this._height; y++){
			if(this._canFillRegion(x, y, z)){
				// Try to fill
				tilesFilled = this._fillRegion(region, x, y, z);
				// If it was too small, just remove it
				if(tilesFilled <= 20){
					this._removeRegion(region, z);
				} else {
					region++;
				}
			}
		}
	}
	
} // _setupRegions()

// Fetch a list of points that overlap between one region 
// at a given level and a region on the level beneath
Game.Builder.prototype._findRegionOverlaps = function(z, r1, r2){
	var matches = [];
	// Iterate through all tiles, checking to make sure they are in
	// the right regions and are floor tiles (so we don't try to put
	// two stairs on the same space)
	for (let x = 0; x < this._width; x++){
		for (let y = 0; y < this._height; y++){
			if (this._tiles[z][x][y] == Game.Tile.floorTile &&
				this._tiles[z+1][x][y] == Game.Tile.floorTile &&
				this._regions[z][x][y] == r1 &&
				this._regions[z+1][x][y] == r2){
				matches.push({x:x, y:y});
			}
		}
	}
	// Shuffle the list to prevent bias
	//return matches.randomize();
	return matches;
	
	
} // findRegionOverlaps()

Game.Builder.prototype._connectRegions = function(z, r1, r2) {
	var overlap = this._findRegionOverlaps(z, r1, r2);
	if (overlap.length == 0){
		//bail out if no overlaps
		return false;
	}
	// Select the first (randomized) tile from the overlap and make it stairs
	let point = overlap[0];
	this._tiles[z][point.x][point.y] = Game.Tile.stairsDownTile;
	this._tiles[z+1][point.x][point.y] = Game.Tile.stairsUpTile;
	return true;
	
} // connectRegions()

// Connect all regions for each depth level,
// starting from the top
Game.Builder.prototype._connectAllRegions = function(){
	for (let z = 0; z < this._depth - 1 ; z++){
		// Iterate through each tile, and if we haven't tried
		// to connect the region of that tile on both depth levels
		// then we try.  We store connected properties as stings
		// for quick lookups
		let connected = {};
		let key;
		for (let x = 0; x < this._width; x++){
			for (let y = 0; y < this._height; y++){
				key = this._regions[z][x][y] + ',' + this._regions[z+1][x][y];
				if (!connected[key] && this._tiles[z][x][y] == Game.Tile.floorTile
									&& this._tiles[z+1][x][y] == Game.Tile.floorTile){
					// Since both tiles are floors and we haven't
					// already connected the two regions, try now

					this._connectRegions(z, this._regions[z][x][y], this._regions[z+1][x][y]);
					connected[key] = true;
				}
			}
		}
	}
}// connectAllRegions()

