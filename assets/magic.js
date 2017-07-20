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

Game.SpellBook.define('',{
	name: '',
	manaCost: {
		white: 0,
		black: 0,
		green: 0,
		blue:  0,
		red:   0
	},
	manaUsed: {
		white: 0,
		black: 0,
		green: 0,
		blue:  0,
		red:   0
	},
	onCast: function(){},
	onExpire: function(){},
	perTurn: function(){},
	timer: ,
	bonus: ,
});

|*|
\*/


// Spell constructor for repository
Game.Spell = function(properties){
	properties = properties || {}; // This should never happen, as we have no useful default set
	
	this._name = properties['name'];
	this._description = properties['description'] || "TODO: Write description";
	this._targets = properties['targets'] || 'self';	// Figure out hitting a ranged target
	
	// Not sure that "|| undefined" is the right way to do this
	// Not all spells have all options - may want to switch to a series of conditionals
	this._manaCost = properties['manaCost'] || {};
	this._manaUsed = properties['manaUsed'] || {};
	
	this._onCast = properties['onCast']     || undefined;
	this._buff = properties['buff'] || {};
	
	this._bonus = properties['bonus']       || {};
};

Game.SpellBook = new Game.Repository('spells', Game.Spell);
Game.SpellBook.getDesc = function(name){
	return this._templates[name].description;
};

Game.SpellBook.define('regen', {
	name: 'regen',
	description: "Heals 1 hp every 5 turns for 20 turns",
	targets: 'self',
	manaCost: { green: 2 },
	onCast: function(target){
	},
	buff: function(target){
		this.duration = 20;
		this.target = target;
		this.onExpire= function(){
			Game.sendMessage(this.target, "The effects of your regen spell fade.");
		};
		
		this.perTurn = function(){	// 'this.target' refers to the target that is part of the 'buff' object
			if (this.healTicks == undefined){
				this.healTicks = 0;
			}
			this.healTicks++;
			if (this.healTicks % 5 == 0){
				this.healTicks = 0;
				this.target.heal(1);
			}
		}
	}
});


