//  Boomerz Start Screen
var BoomerzStartScreen = new Class({
	
	Extends:	GameScreen,
	Implements: Options,
	
	//  Options
	options: {
		
		//  Name
		name:	"start",
		
		ids:	{
			obj:	"bmz-screen-start",
			loader:	"bmz-start-loader",
			setup:	"bmz-start-setup"	
		},
		
		classes:	{
			showSetup:	"showSetup",
			checked:	"checked",
			button:		"btn",
			active:		"active",
			complete:	"complete",
			mask:		"mask",
			loading:	"loading",
			sponsor:	"sponsor",
			hidden:		"hidden"
		},
		
		timing:	{
			minLogoDelay:		3000,
			paperAudioDelay:	500,
			wooshAudioDelay:	1000
		}
		
	},
	
	//  Properties
	setupShown:	false,
	
	//  Initialize
	initialize: function(game, options) {
    
		//  Call parent constructor
		this.parent(game, options);
		
		//  Set load screen references
		this.loader = $(this.options.ids.loader);
		this.loading = this.loader.getElement(utils.css.strToClass(this.options.classes.loading));
		
		//  Save reference to form
		this.setup = $(this.options.ids.setup);
		this.ballot = this.setup.getElement("fieldset");
		
		//  Add radio substitutes
		this.labels = this.setup.getElements("label");
		Array.each(this.labels, function(label, i) {
			label.addEvent(this.events.select, this.selectOption.bind(this));
			return false;
		}.bind(this), this);
		
		//  Add event to submit button
		this.btn = this.setup.getElement(utils.css.strToClass(this.options.classes.button));
		this.setup.addEvent("submit", this.completeSetup.bind(this));
		
		//  Set the mask height as a ratio of the width of the screen to keep ballot box slot in the right spot
		this.mask = this.setup.getElement(utils.css.strToClass(this.options.classes.mask));
		this.resizeMask();
		
		//  Run in 3 seconds if images already preloaded
		this.setLoadDelayPassed.delay(this.options.timing.minLogoDelay, this);

		//  Preload images before proceeding
		this.preloadImages(this.options.images);

		//  Preload audio
		//this.preloadAudio(this.options.audio);
		
		//  Save some audio files
		this.game.loadSound("woosh", this.options.audio.start.woosh);
		this.game.loadSound("ballot-check", this.options.audio.start.ballotCheck);
		this.game.loadSound("ballot-play", this.options.audio.start.ballotPlay);
		this.game.loadSound("ballot-drop", this.options.audio.start.paper);

	},
	
	//  Load delay passed
	setLoadDelayPassed: function() {
		this.loadDelayPassed = true;
		this.run();
	},
	
	//  Run the screen
	run: function() {
		if (this.loadDelayPassed && !this.running) {
			this.parent();
			this.showSetup();
		}
	},
	
	//  Show the setup screen
	showSetup: function() {
		this.game.playSound("woosh");
		if (!this.setupShown) {
			this.obj.addClass(this.options.classes.showSetup);
			this.setupShown = true;
		}
		return false;
	},
	
	//  Select option
	selectOption: function(e) {
		this.game.playSound("ballot-check");
		Array.each(this.labels, function(label, i) {
			label.removeClass(this.options.classes.checked);
		}.bind(this));
		var target = $(e.target);
		target.addClass(this.options.classes.checked);
		target.getElement("input").setProperty("checked", true);
		return false;
	},
	
	//  Complete setup
	completeSetup: function() {
		this.game.playSound("ballot-play");
		this.game.playSound.delay(this.options.timing.paperAudioDelay, this.game, "ballot-drop");
		this.game.playSound.delay(this.options.timing.wooshAudioDelay, this.game, "woosh");
		this.game.initLevelScreen(this.ballot.getElement("input[name=side]:checked").get("value"));
		this.btn.addClass(this.options.classes.active);
		this.ballot.addClass(this.options.classes.complete);
		this.game.container.removeClass(this.options.classes.start);
		this.game.container.addClass(this.options.classes.level);
		this.obj.addClass(this.options.classes.hidden);
		return false;	
	},
	
	//  Resize the mask
	resizeMask: function() {
		this.mask.setStyle("height", (this.setup.getSize().x * 0.15) + "px");
	},
	
	//  Handle window resize
	handleWindowResize: function() {
		this.resizeMask();	
	}
	
});