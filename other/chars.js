var Game =  {
	_display: null,
    _currentScreen: null,
    _screenWidth: 80,
    _screenHeight: 48,
	
	init: function() {
        // Any necessary initialization will go here.
		
		var displayOptions = {
			fontSize: 28,
			width: this._screenWidth,
            height: this._screenHeight
		};
        this._display = new ROT.Display(displayOptions);
		
    }, 	//init
	
	// Basic getters
	getDisplay: function() { return this._display; },
	getScreenWidth: function() { return this._screenWidth; },
	getScreenHeight: function() { return this._screenHeight; },
	
};

Game.drawStuff = function(){
	let display = this._display;
	let things = [
		[String.fromCharCode(644)],
		[String.fromCharCode(134)],
		[String.fromCharCode(660)],
		[String.fromCharCode(741)],
		[String.fromCharCode(742)],
		[String.fromCharCode(743)],
		[String.fromCharCode(744)],
		[String.fromCharCode(745)],
		['A'],
		['B']
	];
	
	for (let i = 0; i < things.length; i++){
		let chr = things[i]
		// let fg = things[i].fg || 'white';
		// let bg = things[i].bg || 'black';
		display.draw(2*i, 28, chr);
		
	}
};

Game.drawStuff2 = function(){
	let x = 24;
	for (let i = 0; i < x; i++){
		for (let j = 0; j < 64; j++){
			this._display.draw(j,i, String.fromCharCode(64*i + j), 'white');
		}
		this._display.drawText(65, i, vsprintf("%s - %s", [i*64,(i+1)*64-1]));
	}
	for (let j = 0; j < 64; j++){
		if(j%2 == 0){
			this._display.draw(j, x, '|');
		}
		if(j%4 == 0){
			this._display.draw(j, x+2, j);
		}
	}
}

window.onload = function() {
    // Check if rot.js can work on this browser
    if (!ROT.isSupported()) {
        alert("The rot.js library isn't supported by your browser.");
    } else {
        // Initialize the game
        Game.init();
        // Add the container to our HTML page
        document.body.appendChild(Game.getDisplay().getContainer());
    }

	Game.drawStuff2();
	Game.drawStuff();
};

