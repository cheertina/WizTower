// Entity Repository (and one-off player template)
Game.PlayerTemplate = {
	name: 'you',
	team: 'player',
	character: '@',
	foreground: 'white',
	background: 'black',
	speed: 1000,
	stats: {
		maxHp: 40,
		hp: 40,
		attack: 10,
		sightRadius: 6,
	},
	inventorySlots: 22,
	mixins: [
		Game.EntityMixins.PlayerActor,
		Game.EntityMixins.Sight,
		Game.EntityMixins.FoodConsumer,
		Game.EntityMixins.PlayerStatGainer,
		Game.EntityMixins.InventoryHolder,
		Game.EntityMixins.MessageRecipient,
		Game.EntityMixins.Equipper,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible,
		Game.EntityMixins.MagicUser,
		Game.EntityMixins.ExperienceGainer]
}; // Player Template

Game.EntityRepository = new Game.Repository('entities', Game.Entity);

/*
the 'stats' entry should contain any of the following things, if they exist for a particular template

*/


// Basic creatures
Game.EntityRepository.define('fungus', {
	name: 'fungus',
	team: 'neutral',
	character: String.fromCharCode(1064), // 'F',
	foreground: 'lime',
	spawns: ['fungus'],
	spawnChance: .02,
	maxSpawns: 5,
	speed: 250,
	stats: {
		maxHp: 10,
		expValue: 2,
	},
	mixins: [
		Game.EntityMixins.Spawner,
		Game.EntityMixins.RngSpawnActor,
		Game.EntityMixins.Destructible
	]
}); // Fungus Template

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	team: 'monster',	// Kobolds ignore monsters, fight neutrals
	foreground: 'white',
	speed: 2000,
	stats: {
		maxHp: 5,
		attack: 4,
		expValue: 6,
	},
	lootTable: [ {item: 'corpse', chance: 100} ],
	mixins: [
		Game.EntityMixins.TaskActor,	// No tasks, so just wander
		Game.EntityMixins.LootDropper,
		Game.EntityMixins.Flying,
		Game.EntityMixins.Attacker,	Game.EntityMixins.Destructible,
		Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer
		]
}); // Bat Template

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
	team: 'monster',
    foreground: 'yellow',
    speed: 1000,
	stats: {
		maxHp: 3,
		attack: 2,
		expValue: 3,
	},
	lootTable: [ {item: 'corpse', chance: 100} ],
	mixins: [
		Game.EntityMixins.TaskActor, 	// No tasks, so just wander
		Game.EntityMixins.LootDropper,
		Game.EntityMixins.Attacker,	Game.EntityMixins.Destructible,
		Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer
	]
});

Game.EntityRepository.define('rat',{
	name: 'rat',
	character: String.fromCharCode(442),
	team: 'monster',
	foreground: 'brown',
	speed: 1000,
	stats: {
		maxHp: 4,
		attack: 2,
		expValue: 5,
	},
	lootTable: [{item: 'corpse', chance: 100}],
	tasks: ['hunt', 'wander'],
	mixins: [
		Game.EntityMixins.Sight,
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.LootDropper,
		Game.EntityMixins.Attacker,	Game.EntityMixins.Destructible,
		Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer
		]
	
});

Game.EntityRepository.define('kobold', {
    name: 'kobold',
    character: 'k',
    foreground: 'white',
    stats: {
		maxHp: 6,
		attack: 4,
		sightRadius: 5,
		expValue: 10,
	},
	lootTable: [ 
		{ item: 'random', chance: 100 },
		{ item: 'random', itemGroup: 'weapon', chance: 60 },
		{ item: 'coin', chance: 20 },
		{ item: 'corpse', chance: 80}
	],
    tasks: ['hunt', 'wander'],
	priorities: {high: ['player'], low: ['neutral']},
    mixins: [
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.Sight,
        Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer,
		Game.EntityMixins.LootDropper]
}, { disableRandomCreation: true });  //Why?

Game.EntityRepository.define('goblin', {
	name: 'goblin',
	character: 'g',
	foreground: 'green',
	stats: {
		maxHP: 12,
		attack: 6,
		sightRadius: 5,
		expValue: 15,
	},
	lootTable: [
	{ item: 'random', chance: 100 },
		{ item: 'random', itemGroup: 'weapon', chance: 40 },
		{ item: 'coin', chance: 20 },
		{ item: 'corpse', chance: 80}
	],
	tasks: ['hunt', 'wander'],
	priorities: {high: ['player']},
    mixins: [
		Game.EntityMixins.TaskActor,
		Game.EntityMixins.Sight,
        Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
        Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer,
		Game.EntityMixins.LootDropper]
});




// Nests
Game.EntityRepository.define('newtNest', {
	name: 'nest',
	character: '&',
	foreground: 'brown',
	maxHp: 200,
	speed: 1000,
	spawnRate: 10,
	maxSpawns: -1,
	spawns: ['newt'],
	mixins: [
		Game.EntityMixins.Spawner,
		Game.EntityMixins.TurnSpawnActor,
		Game.EntityMixins.Destructible]
}, { disableRandomCreation: true });

	