//  Game Sprite
var GameSprite = new Class({

	Implements: Options,
	
	//  Options
	options: {
		name:			"default",
		img:			false,
		delay:			5,
		sheetWidth:		false,
		sheetHeight:	false,
		frameWidth:		0,
		frameHeight:	0,
		numFrames:		1,
		frames:	{
			default:	[0]
		},
		audio:	{}
	},
	
	//  Properties
	xml: false,
	frameBuffers: [],
	
	initialize: function(game, options) {
	
		//  Set options
		this.setOptions(options);
		
		//  Save the game
		this.game = game;
		
		//  Save options for faster reference
		if (options.numFrames) {
			this.numFrames = this.options.numFrames;
		} else {
			var maxFrame = 0;
			Object.each(this.options.frames, function(frames,key) {
				for (var i = 0, numFrames = frames.length; i < numFrames; ++i) {
					if (frames[i] > maxFrame) {
						maxFrame = frames[i];	
					}
				}
			});
			this.numFrames = maxFrame;
		}
		
		//  If the browser is iOS, use PNG instead of SVG because iOS won't render the SVG on canvas
		if (!Browser.Platform.mac && !Browser.Platform.win && !Browser.Platform.linux) {
			this.options.img = utils.file.changeExt(this.options.img, "png");
		}
		
		//  If the sprite sheet width and height weren't passed in, try and get them from the XML of the SVG
		if (!this.options.sheetWidth || !this.options.sheetHeight) {
			var req = new Request({
				url:		this.options.img,
				method:		'get',
				async:		false,
				onRequest:	function(){
					logger.log("get " + this.options.img + " ...");
				}.bind(this),
				onSuccess: function(responseText, responseXML){
					logger.log("got it!");
					if (typeOf(responseXML) != 'document'){
						responseXML = responseXML.documentElement; 
					}
					this.xml = responseXML;
				}.bind(this),
				onFailure: function(){
					logger.log("fail!");
				}
			}).send();
			this.sheetWidth = parseFloat(this.xml.get("width"));
			this.sheetHeight = parseFloat(this.xml.get("height"));
			logger.log("sprite size: " + this.sheetWidth + "x" + this.sheetHeight);
		} else {
			this.sheetWidth = this.options.sheetWidth;
			this.sheetHeight = this.options.sheetHeight;	
		}
		
		//  Set frame properties
		this.frameWidth = this.sheetWidth / this.numFrames;
		this.frameHeight = this.sheetHeight;
		this.frames = this.options.frames;
		this.delay = this.options.delay;
		
		//  Initialize image
		this.img = new Image();
		this.img.onload = this.loadFrameBuffers.bind(this); //  Makes things look jaggy when using frame buffer; use slicing instead(?)
		this.img.onerror = this.handleImageError.bind(this);
		this.img.onabort = this.handleImageAbort.bind(this);
		this.img.src = this.options.img;
		
		//  Save references to state audio, make sure the audio is an array to make it easier later
		this.audio = {};
		for (state in this.options.audio) {
			if (typeOf(this.options.audio[state]) == "string") {
				this.options.audio[state] = [this.options.audio[state]];
			}
			if (this.options.audio[state] && (this.options.audio[state].length > 0)) {
				this.audio[state] = [];
				for (var i = 0, numAudio = this.options.audio[state].length; i < numAudio; ++i) {
					this.audio[state][i] = this.game.loadSound("sprite-"+this.options.name+"-"+state+"-"+i, this.options.audio[state][i]);
				}
			}
		}
	
	},
	
	//  Load frame buffers
	loadFrameBuffers: function() {
		for (var i = 0; i < this.numFrames; ++i) {
			this.frameBuffers[i] = new Element("canvas");
			this.frameBuffers[i].width = this.frameWidth;
			this.frameBuffers[i].height = this.frameHeight;
			var bufferContext = this.frameBuffers[i].getContext('2d');
			bufferContext.drawImage(this.img, ((this.frameWidth * i) * -1), 0, this.sheetWidth, this.sheetHeight);
		}
	},
	
	//  Image aborted
	handleImageAbort: function() {
		logger.log(this.img.src + " load aborted");
	},
	
	//  Image error
	handleImageError: function() {
		logger.log(this.img.src + " failed to load");
	},
	
	//  Play state sound
	playStateSound: function(state) {
		if (this.audio[state] && (this.audio[state].length > 0)) {
			var i = Math.floor(Math.random() * this.audio[state].length);
			this.game.playSound(this.audio[state][i], {loop: false});	
		}
	}
	
});