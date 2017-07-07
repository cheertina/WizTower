// Entity Repository (and one-off player template)
Game.PlayerTemplate = {
	name: 'you',
	team: 'player',
	character: '@',
	foreground: 'white',
	background: 'black',
	speed: 1000,
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
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
		Game.EntityMixins.ExperienceGainer]
}; // Player Template

Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	team: 'neutral',
	character: 'F',
	foreground: 'lime',
	speed: 250,
	maxHp: 10,
	mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible,
		Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer]
}); // Fungus Template

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	team: 'monster',	// Kobolds ignore monsters, fight neutrals
	foreground: 'white',
	speed: 2000,
	maxHp: 5,
	attackValue: 4,
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
	maxHp: 3,
    attackValue: 2,
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
    maxHp: 6,
    attackValue: 4,
    sightRadius: 5,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
            Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
            Game.EntityMixins.ExperienceGainer,	Game.EntityMixins.RandomStatGainer,
			Game.EntityMixins.CorpseDropper]
}, { disableRandomCreation: true });


