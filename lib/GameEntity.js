//  Game Entity
var GameEntity = new Class({

	Implements: Options,
	
	//  Options
	options: {
		id:		0,
		width:	0,
		height:	0,
		x:		0,
		y:		0,
		stepX:	0,
		stepY:	0,
		angle:	0,
		rotate:	false,
		group:	1,
		state:	"active",
		type:	"dynamic",
		sprite:	false
	},
	
	//  Properties
	isScored: false,
	previousState: false,
	
	//  Initialize
	initialize: function(ctx, sprite, options) {
	
		//  Set options -- allow passed options to override sprite options
		this.setOptions(options);
	
		//  Save context and sprite
		this.ctx = ctx;
		this.sprite = sprite;
		
		//  Save more convenient options
		this.id = this.options.id;
		this.width = this.options.width;
		this.height = this.options.height;
		this.x = this.options.x;
		this.y = this.options.y;
		this.angle = this.options.angle;
		this.rotate = this.options.rotate;
		this.group = this.options.group;
		this.state = this.options.state;
		this.type = this.options.type;
		this.stepX = this.options.stepX;
		this.stepY = this.options.stepY;
		
		//  Set the draw height / width
		this.drawWidth = this.width;
		this.drawHeight = this.height;
		
		//  Save the frames
		this.currentFrame = 0;
		this.ticker = 0;
		
	},
	
	//  Get body properties
	getBodyProperties: function() {
		return {
			id:		this.id,
			width:	this.width,
			height:	this.height,
			x:		this.x,
			y:		this.y,
			angle:	this.angle,
			rotate:	this.rotate,
			group:	this.group,
			type:	this.type,
			state:	this.state,
			stepX:	this.stepX,
			stepY:	this.stepY
		};
	},
	
	//  Update the sprite
	update: function(properties) {
		
		//  Only proceed if this state has frame definitions
		if (this.sprite.frames[this.state] && (this.sprite.frames[this.state].length > 0)) {
		
			//  If no properties are passed, add empty object
			if (!properties) {
				properties = {};	
			}
			
			//  Change entity properties
			for (key in properties) {
				this[key] = properties[key];	
			}
			
			//  If the ticker is past the delay, flip to the next frame
			if (this.ticker > this.sprite.options.delay) {
				
				//  Hide the current frame and show the next one
				++this.currentFrame;
				if (this.currentFrame >= this.sprite.frames[this.state].length) {
					this.currentFrame = 0;
				}
				
				//  Reset the ticker
				this.ticker = 0;
				
			//  Or else just increment the ticker
			} else {
				++this.ticker;	
			}
			/*
			//  Figure out the sprite's position on the sprite sheet
			var offsetX = this.sprite.frameWidth * this.sprite.frames[this.state][this.currentFrame];
			var offsetY = 0;
			
			//  Draw the sprite
			this.ctx.drawImage(this.sprite.img, offsetX, offsetY, this.sprite.frameWidth, this.sprite.frameHeight, this.x, this.y, this.drawWidth, this.drawHeight);
			*/
			
			//  Draw the frame using sprite frame buffer
			if (this.sprite.frameBuffers[this.sprite.frames[this.state][this.currentFrame]]) {
				this.ctx.drawImage(this.sprite.frameBuffers[this.sprite.frames[this.state][this.currentFrame]], this.x, this.y, this.drawWidth, this.drawHeight);
			}
			
			//  If there is a sound to play, play it
			if (this.state != this.previousState) {
				this.sprite.playStateSound(this.state);	
			}
			
			//  Save the current state
			this.previousState = this.state;
		
		}
		
	}
	
});