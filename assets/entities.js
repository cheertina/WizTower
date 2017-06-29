// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Movable = {
	name: 'Movable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		// Check if we can walk on the tile
		// and do so, if possible
		if (tile.isWalkable()){
			// Update the entity's position
			this._x = x;
			this._y = y;
			return true;
		} else if (tile.isDiggable()) {
			map.dig(x, y);
			return true;
		}
		return false;
	}
}	// Movable

Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Movable]
}