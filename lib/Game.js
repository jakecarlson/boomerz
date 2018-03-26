//  Game
var Game = new Class({
    
	Implements: Options,
	
	//  Options
	options: {
		muted:			false
	},
	
	//  Properties
	reloading:		false,
	running:		false,
	muted:			false,
	isStandalone:	(window.device),
	
	//  Initialize
	initialize: function(options) {
		
		//  Set options
		this.setOptions(options);
			
		//  Save the game object and container
		this.container = $(this.options.ids.container);
		
		//  Save a game audio helper
		this.audio = new GameAudio();
		
		//  Set initial mute state
		this.muted = this.options.muted;
		
    },
	
	//  Restart
	restart: function(msg) {
		if (msg) {
			msg += " ";	
		} else {
			msg = "";	
		}
		this.reload(msg + "The game will now restart.");
	},
	
	//  Reload
	reload: function(msg) {
		if (!this.reloading) {
			logger.log("Game restarted.");
			this.reloading = true;
			if (msg) {
				alert(msg);
			}
			window.location.reload();
		}
	},
	
	//  Load a sound
	loadSound: function(name, path, options) {
		if (options && this.muted) {
			options.autoplay = false;
		}
		return this.audio.loadSound(name, path, options);
	},
	
	//  Whether the sound is loaded
	soundIsLoaded: function(name) {
		return this.audio.soundIsLoaded(name);	
	},
	
	//  Play a sound
	playSound: function(name, options) {
		if (this.muted) {
			return false;
		} else {
			return this.audio.playSound(name, options);	
		}
	},
	
	//  Pause a sound
	pauseSound: function(name) {
		if (this.muted) {
			return false;
		} else {
			return this.audio.pauseSound(name);	
		}
	},
	
	//  Resume a sound
	resumeSound: function(name) {
		if (this.muted) {
			return false;
		} else {
			return this.audio.resumeSound(name);	
		}
	}
	
});
