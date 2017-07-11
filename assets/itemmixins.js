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
		this._wieldable = template['wieldable'] || false;
		this._ranged = template['ranged'] || false;
		this._wearable = template['wearable'] || false;
	},
	getAttackValue: function(){ return this._attackValue; },
	getRangedAttackValue: function() { return this._rangedAttackValue; },
	getDefenseValue: function(){ return this._defenseValue; },
	isRanged: function() { return (this._wieldable && this._ranged); },
	isWieldable: function(){ return this._wieldable; },
	isWearable: function(){ return this._wearable; }
};

