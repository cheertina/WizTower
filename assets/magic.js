Game.Magic = function(){
	// Core magical mechanics
	// Magic-related
	this.mana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	this.maxMana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	
	this.spellbook = [];
	this.activeSpells = [];
};

Game.Magic.prototype.increaseMaxMana = function(color, delta = 5){
	if( color == 'black' ||
	color == 'white' ||
	color == 'green' ||
	color == 'blue' ||
	color == 'red' ){
		this.maxMana[color] += delta;
	}
	else return false;
};

Game.Magic.prototype.isActive = function(spellName){
	if (this.activeSpells.indexOf(spellName) == -1) return false;
	else return true;
}

// Spell constructor for repository
Game.Spell = function(properties){
	properties = properties || {}; // This should never happen, as we have no useful default set
	
	// These are reqired - no defaults are provided
	// If they're left out, we want it to break
	this._name = properties['name'];
	this._manaCost = properties['manaCost'];
	
	
	this._description = properties['description'] || "TODO: Write description";
	
	
	this._targets = properties['targets'] || 'self';
	
	// For spells that affect the casters, target and caster will be the same entity
	this._onCast = properties['onCast'] || function(target, caster){ return; }
	
	if (properties['buff']) { this._buff = properties['buff']; }
	if (properties['manaUsed']) {
		this._bonus = properties['bonus']; 
		this._manaUsed = properties['manaUsed'];
		this._activeName = properties['activeName'];
	}
	
	
};

// Spell helper functions
Game.Spell.prototype.hasBuff = function(){
	return this.hasOwnProperty('_buff');
};

Game.Spell.prototype.hasActive = function(){
	return this.hasOwnProperty('_activeName');
};

// Spell repository
Game.SpellBook = new Game.Repository('spells', Game.Spell);

// SpellBook helper functions
Game.SpellBook.getName = function(name, colorized = false){
	if(colorized){	// return a formatted string of the spell's name, colorized
		let cost = this._templates[name].manaCost;
		let colors = Object.keys(cost);
		let textColor;
		let bg = "black"
		if(colors.length > 1) { textColor = "gold"}
		else if (colors[0] == "blue") { textColor = "cyan"; }
		else if (colors[0] == "green") { textColor = "lime"; }
		else textColor = colors[0];
		if (textColor == "black") { bg = "dimgray"; }
		let outStr = "%c{"+textColor+"}%b{"+bg+"}"
		outStr += this._templates[name].name;
		outStr += "%c{}%b{}"
	
		return outStr;
	}
	else return this._templates[name].name;	// just the name as a bare string
}
Game.SpellBook.getDesc = function(name){
	return this._templates[name].description;
};

Game.SpellBook.getManaCost = function(name, colorizedString = false){
	if(colorizedString){
		let cost = this._templates[name].manaCost;
		let manaDot = String.fromCharCode(664)
		let returnString = "";
		for (color in cost){
			if (color == 'black'){ returnString += "%c{black}%b{dimgray}"; }
			else if (color == 'blue') {returnString += "%c{cyan}%b{}"; }
			else if (color == 'green') { returnString += "%c{lime}%b{}"; }
			else returnString += "%c{"+color+"}%b{}"
			
			for (let i = 0; i < cost[color]; i++){
				returnString += manaDot;
			}
		}
		returnString +="%c{}%b{}";
		return returnString;
	}
	
	else return this._templates[name].manaCost;
};
Game.SpellBook.getManaUsed = function(name, colorizedString = false){
	if(colorizedString){
		let cost = this._templates[name].manaUsed;
		let manaDot = String.fromCharCode(664)
		let returnString = "";
		for (color in cost){
			if (color == 'black'){ returnString += "%c{black}%b{dimgray}"; }
			else if (color == 'blue') {returnString += "%c{cyan}%b{}"; }
			else if (color == 'green') { returnString += "%c{lime}%b{}"; }
			else returnString += "%c{"+color+"}%b{}"
			
			for (let i = 0; i < cost[color]; i++){
				returnString += manaDot;
			}
		}
		if (returnString !== "") { returnString = "%c{}%b{}(" + returnString + "%c{}%b{})"; }
		return returnString;
	}
	else return this._templates[name].manaUsed;
}

Game.SpellBook.getSpellList = function(){
	return Object.keys(this._templates);
}

/*\ All the spells go here, 
|*| 
|*|	Everything needs a name
|*|		name - the name of the spell
|*|		description - what it does, as shown to the player on the selection screen
|*| 	targets - 'self' or 'ranged' - whether to use the cursor interface or just target the caster
|*| 	manaCost - cost to cast
|*| 
|*| 
|*| Each one may have any or all of the following, but if it has a perTurn it needs a timer
|*| 	onCast - one-shot events
|*| 
|*| 	buff - anything that requires a timer or lasting effect - this is actually a constructor function
|*| 	for an object that contains the following elements, and spells are not the only way to get them
|*|			duration - how many turns it lasts; -1 for unlimited
|*| 		onExpire - delayed one-shot events
|*| 		perTurn - repeated active effects
|*| 
|*| 
|*| 
|*| Optional - Toggle-able passive effects - mixins or stat bonuses
|*| 	manaUsed - for non-timed effects, a decrease in maxMana while active
|*| 	activeName - an ID to keep in the activeSpells array - probably not shown to the player
|*| 	bonus - passive bonus to stats, mixins
|*| 
|*| 
\*/

Game.SpellBook.define('regen', {
	name: 'Regeneration',
	description: "Heals 1 hp every 5 turns for 20 turns",
	targets: 'self',
	manaCost: { green: 2 },
	onCast: function(target, caster){ return; },
	buff: function(target){
		this.name = 'Regeneration';
		this.duration = 20;
		this.target = target;
		this.onExpire= function(){
			Game.sendMessage(this.target, "The effects of your regen spell fade.");
		};
		
		this.perTurn = function(){	// 'this.target' refers to the target that is part of the 'buff' object
			if (this.duration % 5 == 0){ this.target.heal(1); }
		}
	}
});

Game.SpellBook.define('heal', {
	name: 'Heal',
	description: "Heals 5 hp",
	targets: 'self',
	manaCost: { white: 2 },
	onCast: function(target, caster){
		target.heal(5);
	}
});

Game.SpellBook.define('fireball',{
	name: 'Fireball',
	description: "Deals 2 damage, plus an additional 3 damage over 9 turns",
	targets: 'ranged',
	manaCost: {	red: 2 },
	onCast: function(target, caster){
		target.heal(-2);
	},
	buff: function(target, caster){
		this.name = 'Burning';
		this.duration = 9;
		this.target = target;
		this.onExpire= function(){ return; };
		this.perTurn = function(){	// 'this.target' refers to the target that is part of the 'buff' object
			if (this.duration % 3 == 0) { this.target.heal(-1); }
		};
	}
});

Game.SpellBook.define('drain life', {
	name: 'Drain Life',
	description: "Deals 2 damage and heals the caster for an equal amount",
	targets: 'ranged',
	manaCost: { black: 2 },
	onCast: function(target, caster){
		target.heal(-2);
		caster.heal(2);
	}
});

Game.SpellBook.define('blink', {
	name: 'Blink',
	description: "Teleports the caster to a random nearby location",
	targets: 'self',
	manaCost: { blue: 2 },
	onCast: function(target, caster){
		let dx, dy, emptyBool;
		
		do{
			dx = Math.floor((Math.random()*3)+3);
			dx = dx * ( Math.floor(Math.random()*2) ? -1 : +1)
			dy = Math.floor((Math.random()*3)+3);
			dy = dy * ( Math.floor(Math.random()*2) ? -1 : +1)
			
			targetPos = {
				x: target.getX() + dx,
				y: target.getY() + dy,
				z: target.getZ()
			}
			
			emptyBool = target.getMap().isEmptyFloor(targetPos.x, targetPos.y, targetPos.z);
				target.setPosition(targetPos.x, targetPos.y, targetPos.z);
		}while (!emptyBool)
		
	}
});

Game.SpellBook.define('tunneling', {
	name: 'Tunneling',
	description: "Allows the caster to dig through walls",
	targets: 'self',
	manaCost: { red: 1 },
	manaUsed: { red: 1 },
	activeName: 'tunneling',
	bonus: { mixins: [Game.EntityMixins.Digger] }
});

Game.SpellBook.define('rancor', {
	name: 'Rancor',
	description: "Increases attack damage and grants Trample",
	targets: 'self',
	manaCost: { green: 1 },
	manaUsed: { green: 1 },
	activeName: 'rancor',
	bonus: { 
		mixins: [Game.EntityMixins.Trample],
		stats: {attack: 2}
	}
});

Game.SpellBook.define('unholy strength', {
	name: 'Unholy Strength',
	description: "Increases attack and defense",
	targets: 'self',
	manaCost: { black: 1 },
	manaUsed: { black: 1 },
	activeName: 'unholy strength',
	bonus: {
		mixins: [],
		stats: { attack: 2, defense: 1 }
	}
});

Game.SpellBook.define('holy strength', {
	name: 'Holy Strength',
	description: "Increases attack and defense",
	targets: 'self',
	manaCost: { black: 1 },
	manaUsed: { black: 1 },
	activeName: 'holy strength',
	bonus: {
		mixins: [],
		stats: { attack: 1, defense: 2 }
	}
});