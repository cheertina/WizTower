Game.ItemMixins = {};

Game.ItemMixins.Edible = { // Item can be consumed as food
	name: 'Edible',
	init: function(template) {
		// Number of food points
		this._foodValue = template['foodValue'] || 5;
		// Number of times the item can be consumed
		this._maxConsumptions = template['consumptions'] || 1;
		this._remainingConsumptions = this._maxConsumptions;
	},
	eat: function(entity) {
		if (entity.hasMixin('FoodConsumer')) {
			if (this.hasRemainingConsumptions()) {
				entity.modifyFullnessBy(this._foodValue);
				this._remainingConsumptions--;
			}
		}
	},
	hasRemainingConsumptions: function() { return this._remainingConsumptions > 0; },
	describe: function(){
		let desc = '';
		if (this._maxConsumptions != this._remainingConsumptions) {
			desc += 'partially eaten ';
		}
		desc += this._name;
		return desc;
	}
} // Edible

Game.ItemMixins.Equippable = {	// Item can be worn or wielded
	name: 'Equippable',
	init: function(template){
		this._attackValue = template['attackValue'] || 0;
		this._rangedAttackValue = template['rangedAttackValue'] || 0,
		this._defenseValue = template['defenseValue'] || 0;
		this._wearable = template['wearable'] || false;
		this._wieldable = template['wieldable'] || false;
		this._ranged = template['ranged'] || false;
		this._ammoType = template['ammoType'] || 'magic';
	},
	getAttackValue: function(){ return this._attackValue; },
	getRangedAttackValue: function() { return this._rangedAttackValue; },
	getDefenseValue: function(){ return this._defenseValue; },
	getAmmoType: function() {return this._ammoType; },
	isRanged: function() { return (this._wieldable && this._ranged); },
	isWieldable: function(){ return this._wieldable; },
	isWearable: function(){ return this._wearable; }
	
};

Game.ItemMixins.Stackable = {
	name: 'Stackable',
	init: function(template){
		// DEBUG console.log('Stackable item init');
		this._stackSize = template['stackSize'] || 5;
		this._stackCount = template['stackCount'] || 1;
	},
	incCount: function(num = 1){
		// DEBUG console.log("itemmixins.js 60 in incCount()")
		let leftover = 0;
		if (this._stackCount + num > this._stackSize) { 
			leftover = this._stackSize - (this._stackCount + num); 
		}
		this._stackCount += num - leftover;
		return leftover;
	},
	decCount: function(){
		this._stackCount--;
		return this._stackCount;
	}
	
};

Game.ItemMixins.Spellbook = {	// Item can teach the player spells

	name: 'Spellbook',
	init: function(template){
		if (template['spells']){
			this._spells = template['spells'];
		} else {
			let numRndSpells = Math.floor(Math.random() * 2) + 3;
			
			this._spells = [];
			let availSpells = Game.SpellBook.getSpellList().randomize();
			for (let i = 0; i < numRndSpells; i++){
				let idx = Math.floor(Math.random() * availSpells.length);
				this._spells.push(availSpells[idx]);
				availSpells.splice(idx,1);
			}
			
		}
	}
	
};