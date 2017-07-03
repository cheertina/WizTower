// A repository has a name and a constructor. The constructo is used to create
// itesm in the repository
Game.Repository = function(name, ctor){
	this._name = name;
	this._templates = {};
	this._ctor = ctor;
};

Game.Repository.prototype.define = function(name, template){
	this._templates[name] = template;
};

// Spawn an object based on a template
Game.Repository.prototype.create = function(name){
	// Make sure there's a template
	let template = this._templates[name];
	
	if (!template) {
		throw new Error("No template named '" + name +"' in repository'" + this._name + "'");
	}
	
	// Create the object, passing the template as an argument
	return new this._ctor(template);
};

// Creat an object based on a random template
Game.Repository.prototype.createRandom = function() {
	return this.create(Object.keys(this._templates).random());
};

