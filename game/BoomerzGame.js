//  Boomerz Game
var BoomerzGame = new Class({
    
	Extends:	Game,
	
	//  Options
	options: {
		muted:	false
	},
	
	//  Initialize
	initialize: function(options) {
		
		//logger.log("init game");

		//  Call parent constructor
		this.parent(options);
		
		//  Set the body font size for browsers that don't support viewport measurements
		var size = this.container.getSize();
		this.container.setStyle("font-size", (size.y / 15) + "%");
		
		//  Do a browser compatibility check
		/*
		var compatible = ( 
			(
				Browser.Features.xhr &&
				(
					(Browser.Platform.ios && (Browser.version >= 6)) ||
					(Browser.Platform.android && (Browser.version >= 5)) || 
					(Browser.chrome && (Browser.version >= 4)) ||
					(Browser.safari && (Browser.version >= 6)) ||
					(Browser.ie && (Browser.version >= 9)) ||
					(Browser.firefox && (Browser.version >= 4))
				)
			)
		);
		if (compatible) {
			this.compatibilityCheck = $(this.options.ids.compatibility);
			this.compatibilityCheck.addClass(this.options.classes.hidden);	
		}
		*/
		
		//  Disable touch move
		$(document.body).addEvent("touchmove", function(e) {
			e.preventDefault();
		});
		
		//  Initialize the start screen
		var screenOptions = this.options;
		screenOptions.ids.obj = $(this.options.ids.startScreen);
		screenOptions.audio.background = this.options.audio.start.background;
		this.startScreen = new BoomerzStartScreen(this, screenOptions);
		
    },
	
	//  Initialize the level
	initLevelScreen: function(side) {
		var screenOptions = this.options;
		screenOptions.ids.obj = $(this.options.ids.levelScreen);
		screenOptions.ids.obj.addClass(side);
		screenOptions.images.attacker = this.options.images[side].attacker;
		screenOptions.images.background = this.options.images[side].background;
		screenOptions.audio.background = false;
		screenOptions.audio.attacker = this.options.audio[side];
		this.levelScreen = new BoomerzLevelScreen(this, screenOptions, side);	
	}
	
});

//  Initialize the logger
var logger = new Logger(config);
	
//  Initialize the game
var BMZ = new BoomerzGame(config);