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
		Game.EntityMixins.Digger,
		Game.EntityMixins.FoodConsumer,
		Game.EntityMixins.InventoryHolder,
		Game.EntityMixins.MessageRecipient,
		Game.EntityMixins.Equipper,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible]
}; // Player Template

Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	character: 'F',
	foreground: 'lime',
	speed: 250,
	maxHp: 10,
	mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
}); // Fungus Template

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	speed: 2000,
	maxHp: 5,
	attackValue: 4,
	mixins: [
		Game.EntityMixins.TaskActor,	// No tasks, so just wander
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible,
		Game.EntityMixins.CorpseDropper]
}); // Bat Template

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
    foreground: 'yellow',
    speed: 1000,
	maxHp: 3,
    attackValue: 2,
    mixins: [
		Game.EntityMixins.TaskActor, 	// No tasks, so just wander
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible,
		Game.EntityMixins.CorpseDropper]
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
             Game.EntityMixins.CorpseDropper]
});


