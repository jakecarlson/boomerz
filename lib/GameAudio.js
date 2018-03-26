var GameAudio = new Class({

	Implements: Options,
	
	//  Options
	options: {
		
		defaults:	{
			volume:			1,
			filterType:		7, //  All pass
			maxFrequency:	220
		}
		
	},
	
	//  Properties
	ctx: false,
	sounds:	{},
	soundBuffers: {},
	
	//  Initialize
	initialize: function(options) {
    
		//  Set options
		this.setOptions(options);
		
		
		if ('AudioContext' in window) {
			this.ctx = new AudioContext();
			//logger.log("Using AudioContext");
		} else if ('webkitAudioContext' in window) {
			this.ctx = new webkitAudioContext();
			//logger.log("Using webkitAudioContext");
		} else {
			//logger.log("Using <audio> tag fallback");	
		}
				
	},
	
	//  Load a sound
	loadSound: function(name, path, options, delay) {
		
		if (options == undefined) {
			options = {};	
		}
		if (options.autoplay == undefined) {
			options.autoplay = false;	
		}
		if (options.loop == undefined) {
			options.loop = false;	
		}
		if (options.volume == undefined) {
			options.volume = this.options.defaults.volume;	
		}
		if (options.filterType == undefined) {
			options.filterType = this.options.defaults.filterType;	
		}
		if (options.maxFrequency == undefined) {
			options.maxFrequency = this.options.defaults.maxFrequency;	
		}
		
		//  Get the appropriate audio file version
		path = utils.audio.appendSupportedExt(path);
		logger.log("load sound: " + name + " (" + path + ")");
		
		//  Use the audio context if the browser supports it
		if (this.ctx) {
		
			//  If the sound is already loaded, then skip this part
			if (this.soundIsLoaded(name)) {
				if (options.autoplay) {
					this.playSound(name, {loop: options.loop});		
				}
				
			//  Otherwise request it
			} else {		
			
				//  Get the audio and parse it as audio stream	
				var request = new Browser.Request();
				request.open("GET", path, true);
				request.responseType = "arraybuffer";
				
				// Our asynchronous callback
				request.onload = function() {
					
					//  Save the sound buffer
					this.soundBuffers[name] = request.response;
					
					//  If autoplay is set, play the sound right now
					if (options.autoplay) {
						this.playSound(name, {loop: options.loop});	
					}
				
				}.bind(this);
				
				//  Send the request
				request.send();
			
			}
		
		//  Or else fall back to the audio tag resource
		} else {
			
			//  If the sound isn't already loaded, load it now
			if (!this.soundIsLoaded(name)) {
			
				this.sounds[name] = new Audio(path);
				this.sounds[name].loop = options.loop;
				this.sounds[name].preload = true;
				this.sounds[name].autobuffer = true;
				this.sounds[name].volume = options.volume;
				this.sounds[name].load();
			
			}
			
			//  If we should autoplay, play it now
			if (options.autoplay) {
				this.playSound(name, {loop: options.loop});
			}
			
		}
		
		//  Return the name
		return name;
		
	},
	
	//  Play a sound
	playSound: function(name, options) {
		
		//  Set default options
		if (options == undefined) {
			options = {};	
		}
		if (options.loop == undefined) {
			options.loop = false;	
		}
		if (options.concurrent == undefined) {
			options.concurrent = false;	
		}
		
		if (this.soundIsLoaded(name)) {
			
			//  If using an audio context and this sound is not already playing, play it
			if (this.ctx) {
				
				//  If the sound isn't already playing, create the sound and buffer
				if (!this.sounds[name] || options.concurrent || (this.sounds[name].playbackState == 3)) {
					this.sounds[name] = this.ctx.createBufferSource();
					this.sounds[name].loop = options.loop;
					this.sounds[name].buffer = this.ctx.createBuffer(this.soundBuffers[name], false);
					this.sounds[name].connect(this.ctx.destination);
					this.sounds[name].noteOn(0);
				}
				
			} else {
				if (this.sounds[name].currentTime > 0) {
					this.sounds[name].currentTime = 0;
				}
				this.sounds[name].play();	
			}
			logger.log("play sound: " + name);
		} else {
			logger.log("sound " + name + " cannot play!");	
		}
	},
	
	//  Pause a sound
	pauseSound: function(name) {
		if (this.soundIsLoaded(name)) {
			if (this.ctx) {
				this.sounds[name].noteOff(this.ctx.currentTime);
			} else {
				this.sounds[name].pause();
			}
			logger.log("pause sound: " + name);
		} else {
			logger.log("sound " + name + " cannot pause!");	
		}
	},
	
	//  Resume a sound
	resumeSound: function(name) {
		if (this.soundIsLoaded(name)) {
			if (this.ctx) {
				this.sounds[name].noteOn(this.ctx.currentTime);
			} else {
				this.sounds[name].play();
			}
			logger.log("resume sound: " + name);
		} else {
			logger.log("sound " + name + " cannot resume!");	
		}
	},
	
	//  Whether or not a sound is loaded
	soundIsLoaded: function(name) {
		if (this.ctx) {
			return (this.soundBuffers[name] != undefined);
		} else {
			return (this.sounds[name] != undefined);	
		}
	}
	
});