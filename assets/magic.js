Game.Magic = function(){
	// Core magical mechanics
	// Magic-related
	this.mana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	this.maxMana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	
	
	this.spellbook = {};
	
};

Game.Magic.prototype.increaseMaxMana = function(color, delta = 10){
	if( color == 'black' ||
	color == 'white' ||
	color == 'green' ||
	color == 'blue' ||
	color == 'red' ){
		this.maxMana[color] += delta;
	}
	else return false;
};


