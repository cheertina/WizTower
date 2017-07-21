Game.Magic = function(){
	// Core magical mechanics
	// Magic-related
	this.mana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	this.maxMana = { white: 0, black: 0, green: 0, blue:  0, red:   0 };
	
	this.spellbook = [];
	
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


/*\ All the spells go here, 
|*| 
|*|	Everything needs a name
|*|		name - the name of the spell
|*|
|*| Everything should have at least one of these
|*| 	manaCost - cost to cast
|*| 	manaUsed - for non-timed effects, a decrease in maxMana while active
|*|			This will also require a way to cancel the effect, which doesn't currently exist
|*| 
|*| Each one may have any or all of the following
|*| 	onCast - one-shot events
|*| 	onExpire - delayed one-shot events
|*|		timer - how long it lasts
|*| 	perTurn - repeated active effects - this should set up a buff with an effect() function
|*| 
|*| This may not be worth it, might be better off using onCast/Expire for this
|*| 	bonus - passive bonus to stats
|*|
|*|
\*/


// Spell constructor for repository
Game.Spell = function(properties){
	properties = properties || {}; // This should never happen, as we have no useful default set
	
	this._name = properties['name'];
	this._description = properties['description'] || "TODO: Write description";
	this._targets = properties['targets'] || 'self';	// Figure out hitting a ranged target
	
	//Some properties need default values, some don't
	
	this._manaCost = properties['manaCost'] || {};
	this._manaUsed = properties['manaUsed'] || {};
	
	this._onCast = properties['onCast']     || function(target){ return; }
	
	if (properties['buff']) { this._buff = properties['buff']; }
	if (properties['bonus']) { this._buff = properties['bonus']; }
	
	
};
Game.Spell.prototype.hasBuff = function(){
	return this.hasOwnProperty('_buff');
}


Game.SpellBook = new Game.Repository('spells', Game.Spell);
Game.SpellBook.getName = function(name, colorized = false){
	if(colorized){
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
	else return this._templates[name].name;
}

Game.SpellBook.getDesc = function(name){
	return this._templates[name].description;
};
Game.SpellBook.getManaCost = function(name){
	return this._templates[name].manaCost;
};

Game.SpellBook.define('regen', {
	name: 'Regeneration',
	description: "Heals 1 hp every 5 turns for 20 turns",
	targets: 'self',
	manaCost: { green: 2 },
	onCast: function(target, caster){ return; },
	buff: function(target){
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
	manaCost: {	red: 2 },
	targets: 'ranged',
	onCast: function(target, caster){
		target.heal(-2);
	},
	buff: function(target, caster){
		this.duration = 9;
		this.target = target;
		this.onExpire= function(){ };
		this.perTurn = function(){	// 'this.target' refers to the target that is part of the 'buff' object
			if (this.duration % 3 == 0) { this.target.heal(-1); }
		};
	}
});

Game.SpellBook.define('drain life', {
	name: 'Drain Life',
	description: "Deals 2 damage and heals the caster for an equal amount",
	manaCost: { black: 2 },
	targets: 'ranged',
	onCast: function(target, caster){
		target.heal(-2);
		caster.heal(2);
	}
});

Game.SpellBook.define('blink', {
	name: 'Blink',
	description: "Teleports the caster to a random nearby location",
	manaCost: { blue: 2 },
	targets: 'self',
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
