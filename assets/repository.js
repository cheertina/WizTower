// A repository has a name and a constructor. The constructor is used to create
// item in the repository
Game.Repository = function(name, ctor){
	this._name = name;
	this._templates = {};
	this._randomTemplates = {};
	this._ctor = ctor;
};

Game.Repository.prototype.define = function(name, template, options){
	this._templates[name] = template;
	let disableRandomCreation = options && options['disableRandomCreation'];
	if (!disableRandomCreation) {
		this._randomTemplates[name] = template;
	}
};

// Spawn an object based on a template
Game.Repository.prototype.create = function(name, extraProperties){
	// Make sure there's a template
	if (!this._templates[name]) {
		throw new Error("No template named '" + name +"' in repository'" + this._name + "'");
	}
	
	// Copy the template and then apply any extra properties
	let template = Object.create(this._templates[name]);
	if (extraProperties) {
		for (let key in extraProperties) {
			template[key] = extraProperties[key];
		}
	}
	
	// Create the object, passing the template as an argument
	return new this._ctor(template);
};

// Creat an object based on a random template
Game.Repository.prototype.createRandom = function() {
	return this.create(Object.keys(this._randomTemplates).random());
};

