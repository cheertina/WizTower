Game.ItemMixins = {};

// Edible mixins
Game.ItemMixins.Edible = {
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
}