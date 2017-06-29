// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Movable = {
	name: 'Movable',
	tryMove: function(x, y, map) {
		var tile = map.getTile(x, y);
		var target = map.getEntityAt(x, y);
		// Can't move onto an entity
		if(target) { return false; }
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

// Main player's actor mixin
Game.Mixins.PlayerActor = {
	name: 'PlayerActor',
	groupName: 'Actor',
	act: function(){
		// Re-render the screen
		Game.refresh();
		// Lock the engine and wait asynchronously
		// for keyboard input
		this.getMap().getEngine().lock();
	}
}

Game.Mixins.FungusActor = {
	name: 'FungusActor',
	groupName: 'Actor',
	act: function(){ }	// Do nothing
}

// Entity Templates

Game.PlayerTemplate = {
	character: '@',
	foreground: 'white',
	background: 'black',
	mixins: [Game.Mixins.Movable, Game.Mixins.PlayerActor]
}

Game.FungusTemplate = {
	character: 'F',
	foreground: 'green',
	mixins: [Game.Mixins.FungusActor]
}