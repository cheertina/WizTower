Game.ItemRepository = new Game.Repository('items', Game.Item);

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

Game.ItemRepository.define('spellbook', {
	name: 'spellbook',
	character: ['#'],
	foreground: 'cyan',
	spells: ['heal', 'fireball'],
	mixins: [Game.ItemMixins.Spellbook]
}, {disableRandomCreation: true});

Game.ItemRepository.define('apple', {
	name: 'apple',
	character: '%',
	foreground: 'red',
	foodValue: 50,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('melon', {
	name: 'melon',
	character: '%',
	foreground: 'greenYellow',
	foodValue: 35,
	consumptions: 4,
	mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('rock', {
	name: 'rock',
	character: '*',
	foreground: 'white',
	stackSize: 10,
	mixins: [Game.ItemMixins.Stackable]
});

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
	forground: 'grey',
	rangedAttackValue: 2,
	wieldable: true,
	ranged: true,
	ammoType: 'rock',
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('Staff of Energy Bolt', {
	name: 'Staff of Energy Bolt',
	character: ['!'],
	foreground: 'yellow',
	attackValue: 2,
	rangedAttackValue: 6,
	wieldable: true,
	ranged: true,
	ammoType: 'magic',
	mixins: [Game.ItemMixins.Equippable]
}, {disableRandomCreation: true})

// Melee Weapons
Game.ItemRepository.define('dagger', {
	name: 'dagger',
	character: ')',
	foreground: 'gray',
	attackValue: 5,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('sword', {
	name: 'sword',
	character: ')',
	foreground: 'white',
	attackValue: 10,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('quarterstaff', {
	name: 'staff',
	character: ')',
	foreground: 'yellow',
	attackValue: 5,
	defenseValue:3,
	wieldable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

// Armor
Game.ItemRepository.define('tunic', {
	name: 'tunic',
	character: '[',
	foreground: 'green',
	defenseValue: 2,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('chainmail', {
	name: 'chainmail',
	character: '[',
	foreground: 'white',
	defenseValue: 4,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

 Game.ItemRepository.define('platemail', {
	name: 'platemail',
	character: '[',
	foreground: 'aliceblue',
	defenseValue: 6,
	wearable: true,
	mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

