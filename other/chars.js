var Game =  {
	_display: null,
    _currentScreen: null,
    _screenWidth: 80,
    _screenHeight: 24,
	
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
		{chr: [String.fromCharCode(55)]},
		{chr: [String.fromCharCode(127)]},
		{chr: [String.fromCharCode(225)]}
	];
	
	for (let i = 0; i < things.length; i++){
		let chr = things[i].chr;
		// let fg = things[i].fg || 'white';
		// let bg = things[i].bg || 'black';
		
		display.draw(1, i, chr, 'gray',  'black');
		display.draw(3, i, chr, 'white', 'black');
		display.draw(5, i, chr, 'green', 'black');
		display.draw(7, i, chr, 'blue',  'black');
		display.draw(9, i, chr, 'black', 'gray ');
		display.draw(11, i, chr,'red',   'black');
	}
};

Game.drawStuff2 = function(){
	for (let i = 0; i < 16; i++){
		for (let j = 0; j < 64; j++){
			this._display.draw(j,i, String.fromCharCode(64*i + j), 'white');
		}
		this._display.drawText(65, i, vsprintf("%s - %s", [i*64,(i+1)*64]));
	}
	for (let j = 0; j < 64; j++){
		if(j%2 == 0){
			this._display.draw(j, 16, '|');
		}
		if(j%4 == 0){
			this._display.draw(j, 18, j);
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
};

