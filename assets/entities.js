// Entity Repository (and one-off player template)
Game.PlayerTemplate = {
	name: 'you',
	team: 'player',
	character: '@',
	foreground: 'white',
	background: 'black',
	maxHp: 40,
	attackValue: 10,
	sightRadius: 6,
	inventorySlots: 22,
	mixins: [
		Game.EntityMixins.Digger,
		Game.EntityMixins.InventoryHolder,
		Game.EntityMixins.Sight,
		Game.EntityMixins.PlayerActor,
		Game.EntityMixins.MessageRecipient,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible]
}; // Player Template

Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
	name: 'fungus',
	character: 'F',
	foreground: 'lime',
	maxHp: 10,
	mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
}); // Fungus Template

Game.EntityRepository.define('bat', {
	name: 'bat',
	character: 'B',
	foreground: 'white',
	maxHp: 5,
	attackValue: 4,
	mixins: [
		Game.EntityMixins.WanderActor,
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible]
}); // Bat Template

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: ':',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [
		Game.EntityMixins.WanderActor, 
		Game.EntityMixins.Attacker,
		Game.EntityMixins.Destructible]
});

