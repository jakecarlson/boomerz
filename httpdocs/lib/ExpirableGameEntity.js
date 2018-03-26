//  Expirable Game Entity
var ExpirableGameEntity = new Class({

	Extends:	GameEntity,
	Implements: Options,
	
	//  Options
	options: {
		maxHealth:	100,
		health:		100
	},
	
	//  Initialize
	initialize: function(ctx, sprite, options) {
	
		//  Call parent
		this.parent(ctx, sprite, options);
		
		//  Set state variables
		this.maxHealth = this.options.maxHealth;
		this.health = this.options.maxHealth; 
		
	},
	
	//  Get body properties
	getBodyProperties: function() {
		var props = this.parent();
		props.health = this.health;
		return props;
	},
	
	//  Change health
	changeHealth: function(amount) {
		amount = utils.math.translatePercentage(amount, this.maxHealth);
		this.health = this.health + amount;
		if (this.health > this.maxHealth) {
			this.health = this.maxHealth;	
		} else if (this.health < 0) {
			this.health = 0;
		}
		return this.health;
	}
	
});