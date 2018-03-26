var GameScreen = new Class({

	Implements: Options,
	
	//  Options
	options: {
		
		//  Name of screen
		name:	"default",
		
		//  IDs
		ids:	{
			obj:	"screen"
		},
		
		//  Images
		images: {
			background:	false
		}
		
	},
	
	//  Properties
	inputMechanism:		"mouse",
	eventPresets:		{
		touch:	{
			dragStart:	"touchstart",
			dragMove:	"touchmove",
			dragEnd:	"touchend",
			dragEndAlt:	false,
			select:		"touchstart"
		},
		mouse:	{
			dragStart:	"mousedown",
			dragMove:	"mousemove",
			dragEnd:	"mouseup",
			dragEndAlt:	"mouseleave",
			select:		"click"
		}
	},
	input:	{
		x:	undefined,
		y:	undefined
	},
	running:			false,
	numImagesToLoad:	0,
	numLoadedImages:	0,
	numAudioToLoad:		0,
	numLoadedAudio:		0,
	audio:				{},
	imagesPreloaded:	false,
	audioPreloaded:		false,
	width: 0,
	height: 0,
	resizing: false,
	previousWidth: 0,
	previousHeight: 0,
	
	//  Initialize
	initialize: function(game, options) {
    
		//  Save a reference to the game
		this.game = game;
	
		//  Set options
		this.setOptions(options);
		
		//  Set objects
		this.obj = $(this.options.ids.obj);
		this.container = this.obj.getParent();
		
		//  Save the event set
		if (Browser.Features.Touch) {
			this.inputMechanism = "touch";	
		}
		this.events = this.eventPresets[this.inputMechanism];
		
		//  If there is a background image, set it
		if (this.options.images.background) {
			this.obj.setStyle("background-image", 'url("'+this.options.images.background+'")');	
		}
		
		//  If there is background music, start it
		if (this.options.audio.background) {
			this.startBackgroundAudio();
		}
		
		//  Set the screen size
		this.setSize();
		
		//  Reevaluate position dependent coordinates on window resize / orientation change
		window.addEvents({
			orientationchange:	this.handleWindowResize.bind(this),
			resize:				this.handleWindowResize.bind(this)
		});
		
	},
	
	//  Run screen
	run: function() {
		this.running = true;
		logger.log("run screen");
	},
	
	//  Stop screen
	stop: function() {
		this.running = false;
		logger.log("stop screen");
	},
	
	//  Preload images
	preloadImages: function(images) {
		Object.each(images, function(img, key) {
			if (typeOf(img) == "string") {
				++this.numImagesToLoad;
				Asset.image(img, {
					onLoad: 	this.loadImage.bind(this),
					onError:	this.logImageError.bind(this),
					onAbort:	this.logImageAbort.bind(this)	
				});
			} else {
				this.preloadImages(img);	
			}
		}, this);
	},
	
	//  Load image
	loadImage: function() {
		++this.numLoadedImages;
		logger.log(this.numLoadedImages + "/" + this.numImagesToLoad + " images loaded");
		if (this.numLoadedImages >= this.numImagesToLoad) {
			this.imagesPreloaded = true;
			if (this.audioPreloaded) {
				this.run();	
			}
		}
	},
	
	//  Preload audio
	preloadAudio: function(audioFiles) {
		Object.each(audioFiles, function(audio, key) {
			if (typeOf(audio) == "string") {
				++this.numAudioToLoad;
				this.audio[key] = new Audio(utils.audio.appendSupportedExt(audio));
				this.audio[key].addEventListener("canplaythrough", this.loadAudio.bind(this), false);
			} else {
				this.preloadAudio(audio);	
			}
		}, this);
	},
	
	//  Load audio
	loadAudio: function() {
		++this.numLoadedAudio;
		logger.log(this.numLoadedAudio + "/" + this.numAudioToLoad + " audio loaded");
		if (this.numLoadedAudio >= this.numAudioToLoad) {
			this.audioPreloaded = true;
			if (this.imagesPreloaded) {
				this.run();	
			}
		}
	},
	
	//  Handle a resize event
	handleWindowResize: function() {
		//  do nothing by default
	},
	
	//  Set the screen size
	setSize: function() {
		
		//  Set the size
		var screenSize = this.obj.getSize();
		this.width = screenSize.x;
		this.height = screenSize.y;
		
		//  Resize convases
		this.resizeCanvases();
		
	},
	
	//  Resize all canvases on this screen to fit the container
	resizeCanvases: function() {
		var canvases = this.obj.getElements("canvas");
		for (var i = 0, numCanvases = canvases.length; i < numCanvases; ++i) {
			canvases[i].width = this.width;
			canvases[i].height = this.height;
		}
	},
	
	//  Start background audio
	startBackgroundAudio: function() {
		if (!this.game.soundIsLoaded("screen-"+this.options.name)) {
			this.game.loadSound("screen-"+this.options.name, this.options.audio.background, {autoplay: true, loop: true});
		} else {
			this.game.playSound("screen-"+this.options.name, {loop: true});	
		}
	},
	
	//  End background audio
	stopBackgroundAudio: function() {
		if (this.game.soundIsLoaded("screen-"+this.options.name)) {
			this.game.pauseSound("screen-"+this.options.name);
		}
	},
	
	//  Log image error
	logImageError: function() {
		logger.log("error loading image");	
	},
	
	//  Log image abort
	logImageAbort: function() {
		logger.log("image load aborted");	
	},
	
	//  Destroy the screen
	destroy: function() {
		this.obj.dispose();	
	}
	
});