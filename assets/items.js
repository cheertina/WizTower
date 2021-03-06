Game.ItemRepository = new Game.Repository('items', Game.Item);


Game.ItemRepository.createRandomByGroup = function(itemGroup){
	let possibilities =	Object.keys(this._randomTemplates);
	let temp = this._randomTemplates;
	for (let i = possibilities.length - 1; i >= 0; i--){
		if (temp[possibilities[i]].itemGroup !== itemGroup){
			possibilities.splice(i,1);
		}
	}
	return this.create(possibilities.random());
};

// Override the one on the prototype so we can provide a default group for item templates
Game.ItemRepository.define = function(name, template, options){
	if(!template.hasOwnProperty('itemGroup')){ template.itemGroup = 'junk'; }
	Game.Repository.prototype.define.call(this, name, template, options);
}


/* Possible glyphs for things

String.fromCharCode(644) - sword with hilt - ʄ
134 - Dagger - standard typographic, doesn't show in Notepad++

660 - Scythe - ʔ

741 - ˥
742 - ˦
743 - ˧
744 - ˨
745 - ˩

*/


// No plans to use money for anything, but this will serve as a good test for entity drops
Game.ItemRepository.define('coin', {	
	name: 'coin',
	character: String.fromCharCode(186),
	foreground: 'gold',
	stackSize: 1000,
	mixins: [Game.ItemMixins.Stackable]
});

// Spellbooks
Game.ItemRepository.define('spellbook', {	// Contains a few random spells
	name: 'spellbook',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'peru',
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbookRed', {
	name: 'red spellbook',
	itemGroup: 'book',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'red',
	spells: ['tunneling', 'fireball'],
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbookBlue', {
	name: 'blue spellbook',
	itemGroup: 'book',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'cyan',
	spells: ['blink', 'flying'],
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbookGreen', {
	name: 'green spellbook',
	itemGroup: 'book',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'lime',
	spells: ['rancor','wild growth','regen','biostasis'],
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbookBlack', {
	name: 'black spellbook',
	itemGroup: 'book',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'black',
	background: 'grey',
	spells: ['drain life', 'unholy strength', 'summont rat'],
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbookWhite', {
	name: 'white spellbook',
	itemGroup: 'book',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'white',
	spells: ['heal','holy strength'],
	mixins: [Game.ItemMixins.Spellbook]
});

Game.ItemRepository.define('spellbook2', {	// Contains all spells
	name: 'universal spellbook',
	character: [String.fromCharCode(9647), String.fromCharCode(991)],
	foreground: 'gold',
	spells: Game.SpellBook.getSpellList().slice(),	// slice() keeps this from being a reference to the same array
	mixins: [Game.ItemMixins.Spellbook]
}, {disableRandomCreation: true});
 
// Food
Game.ItemRepository.define('apple', {
	name: 'apple',
	itemGroup: 'food',
	character: '%',
	foreground: 'red',
	foodValue: 50,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('melon', {
	name: 'melon',
	itemGroup: 'food',
	character: '%',
	foreground: 'greenYellow',
	foodValue: 35,
	consumptions: 4,
	mixins: [Game.ItemMixins.Edible]
});

// Ammo
Game.ItemRepository.define('rock', {
	name: 'rock',
	character: '*',
	foreground: 'white',
	stackSize: 10,
	mixins: [Game.ItemMixins.Stackable]
});

Game.ItemRepository.define('arrow', {
	name: 'arrow',
	character: ['^','|'],
	foreground: 'white',
	stackSize: 10,
	mixins: [Game.ItemMixins.Stackable]
});


// Misc
Game.ItemRepository.define('corpse', {
	name: 'corpse',
	character: '%',
	foodValue: 75,
	consumptions: 1,
	mixins: [Game.ItemMixins.Edible]
}, {	// creation options
	disableRandomCreation: true
});

// Ranged Weapons
Game.ItemRepository.define('sling', {
	name: 'sling',
	character: ['}','='],
	itemGroup: 'weapon',
	forground: 'grey',
	rangedAttackValue: 2,
	wieldable: true,
	ranged: true,
	ammoType: 'rock',
	mixins: [Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('bow', {
	name: 'bow',
	character: ['}','='],
	itemGroup: 'weapon',
	forground: 'grey',
	rangedAttackValue: 4,
	wieldable: true,
	ranged: true,
	ammoType: 'arrow',
	mixins: [Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('Wand of Energy Bolt', {
	name: 'Wand of Energy Bolt',
	character: ['!'],
	itemGroup: 'weapon',
	foreground: 'yellow',
	attackValue: 2,
	rangedAttackValue: 6,
	wieldable: true,
	ranged: true,
	ammoType: 'magic',
	mixins: [Game.ItemMixins.Equippable]
})

// Melee Weapons
Game.ItemRepository.define('dagger', {
	name: 'dagger',
	character: ')',
	itemGroup: 'weapon',
	foreground: 'gray',
	attackValue: 5,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('sword', {
	name: 'sword',
	character: ')',
	itemGroup: 'weapon',
	foreground: 'white',
	attackValue: 10,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('quarterstaff', {
	name: 'staff',
	character: ')',
	itemGroup: 'weapon',
	foreground: 'yellow',
	attackValue: 5,
	defenseValue:3,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
});

// Armor
Game.ItemRepository.define('tunic', {
	name: 'tunic',
	character: '[',
	itemGroup: 'armor',
	foreground: 'green',
	defenseValue: 2,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
});

Game.ItemRepository.define('chainmail', {
	name: 'chainmail',
	character: '[',
	itemGroup: 'armor',
	foreground: 'white',
	defenseValue: 4,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
});

 Game.ItemRepository.define('platemail', {
	name: 'platemail',
	character: '[',
	itemGroup: 'armor',
	foreground: 'aliceblue',
	defenseValue: 6,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
});
