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
	character: 'F',
	foreground: 'lime',
	spawns: ['fungus'],
	spawnChance: .02,
	maxSpawns: 5,
	speed: 250,
	stats: {
		maxHp: 10,
	},
	mixins: [Game.EntityMixins.Spawner, Game.EntityMixins.RngSpawnActor, Game.EntityMixins.Destructible]
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
	},
	mixins: [
		Game.EntityMixins.TaskActor,	// No tasks, so just wander
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible,
		Game.EntityMixins.CorpseDropper,
		Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer
		]
}); // Bat Template

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
	team: 'neutral',
    foreground: 'yellow',
    speed: 1000,
	stats: {
		maxHp: 3,
		attack: 2,
	},
    mixins: [
		Game.EntityMixins.TaskActor, 	// No tasks, so just wander
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible,
		Game.EntityMixins.CorpseDropper,
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
	},
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
            Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
            Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer,
			Game.EntityMixins.CorpseDropper, Game.EntityMixins.LootDropper]
}, { disableRandomCreation: true });

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

	