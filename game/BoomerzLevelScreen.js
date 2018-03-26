//  Boomerz Level Screen
var BoomerzLevelScreen = new Class({
	
	Extends:	GameLevelScreen,
	Implements: Options,
	
	//  Options
	options: {
		
		//  Name
		name:	"level",
		
		//  Refresh rate / performance
		adaptiveRefresh:	false,
		useWorker: 			false,
		workerScript:		'lib/workerGameLoop.js',
		
		//  Scoring
		scoring:	{
			pointsPerKill:		100,
			bonusKillFactor:	300,
			compromiseCost:		500,
			cliffCost:			2500,
			filibusterCost:		1000
		},
		
		//  Damage settings
		damage: {
			attackerHealth:				100,
			attackerCollisionFactor:	6000,
			wallHealth:					100,
			wallAttackDamage:			-1,
			compromiseRepair:			25
		},
		
		//  Timing settings
		timing: {
			
			//  Game
			game:	{
				resizeWindowDelay:	1000,
				endGameDelay:		500,
				cliffDuration:		10000
			},
			
			//  Attackers
			attacker:	{
				addIntervalMin:		100,
				addIntervalMax:		300,
				addIntervalStep:	-5,
				addIntervalBase:	25,
				getUpDelay:			1000,
				removeDelay:		1000
			}
			
		},
		
		//  World
		world: {
			
			//  Basic physics
			scale:				100,
			gravity:			100,
			
			//  Fixtures
			fixtures:	{
				density:		100,
				friction:		1,
				restitution:	0	
			},
			
			//  Number of plains for the attackers
			numPlains:			3,
			
			//  Loop actions
			loopActions:	[
				
				{
					type:			"input",
					action:			"drag",
					dragState:		"dragging",
					dropState:		"falling",
					ignoreStates:	["dead"]
				},
			
				{
					type:	"move",
					state:	"walking",
					stepX:	5,
					stepY:	0
				}
		
			]
			
		},
		
		//  Text
		text:	{
			enemy:	{
				liberal:		"conservative",
				conservative:	"liberal"	
			},
			building:	{
				liberal:		"White House",
				conservative:	"Capitol Building"
			},
			input:	{
				touch:	"Tap",
				mouse:	"Click"
			}
		}
		
	},
	
	//  Properties
	numWallHits: 0,
	registerWallHits: false,
	wallBroken:	false,
	wallCracked: false,
	nextAttackerTick: 0,
	compromiseEnabled: false,
	cliffDeployed: false,
	cliffEnabled: false,
	filibusterEnabled: false,
	foot: false,
	footHitGround: false,
	scoredEntities:	[],
	
	//  Initialize
	initialize: function(game, options, side) {
	
		//  Set the collision postsolve event
		options.events = {
			collision:	{
				postSolve: this.handleCollision
			}
		};
		
		//  Set options
		this.parent(game, options);
		
		//  Create screen boundaries
		this.boundaryPlains = this.createBoundaryPlains({
			num:		3,
			stepX:		"-5%",	
			stepY:		"-3%",
			top:		"-100%",
			left:		"-50%",
			right:		"97.5%",
			bottom:		"87.5%",
			thickness:	"1%",
			group:		1,
			stepGroup:	1
		});
		
		//  Replace enemy
		var enemy = this.options.text.enemy[side];
		var spans = this.obj.getElements(utils.css.strToClass(this.options.classes.enemy));
		for (var i = 0, numSpans = spans.length; i < numSpans; ++i) {
			spans[i].set("text", enemy);
		}
		
		//  Replace input
		var input = this.options.text.input[this.inputMechanism];
		var spans = this.obj.getElements(utils.css.strToClass(this.options.classes.input));
		for (var i = 0, numSpans = spans.length; i < numSpans; ++i) {
			spans[i].set("text", input);
		}
		
		//  Replace building
		var building = this.options.text.building[side];
		var spans = this.obj.getElements(utils.css.strToClass(this.options.classes.building));
		for (var i = 0, numSpans = spans.length; i < numSpans; ++i) {
			spans[i].set("text", building);
		}
		
		//  Attach events to menu buttons
		this.menuObj = $(this.options.ids.menu);
		this.startObj = this.menuObj.getElement(utils.css.strToClass(this.options.classes.start));
		if (this.startObj) {
			this.startObj.getElement("a").addEvent(this.events.select, this.run.bind(this));
		}
		this.restartObj = this.menuObj.getElement(utils.css.strToClass(this.options.classes.restart));
		if (this.restartObj) {
			this.restartObj.getElement("a").addEvent(this.events.select, this.restart.bind(this));
		}
		
		//  Attach events to game screen buttons
		this.pauseObj = $(this.options.ids.pauseBtn);
		if (this.pauseObj) {
			this.pauseObj.addEvent(this.events.select, this.togglePause.bind(this));
		}
		this.compromiseObj = $(this.options.ids.compromiseBtn);
		if (this.compromiseObj) {
			this.compromiseObj.addEvent(this.events.select, this.handleCompromise.bind(this));
		}
		this.cliffObj = $(this.options.ids.cliffBtn);
		if (this.cliffObj) {
			this.cliffObj.addEvent(this.events.select, this.handleCliff.bind(this));
		}
		this.filibusterObj = $(this.options.ids.filibusterBtn);
		if (this.filibusterObj) {
			this.filibusterObj.addEvent(this.events.select, this.handleFilibuster.bind(this));
		}
		
		//  Save references to score objects
		this.scoreObj = $(this.options.ids.score);
		this.scoreNumObj = this.scoreObj.getElement(utils.css.strToClass(this.options.classes.num));
		
		//  Add attacker sprite
		this.attackerWidth = utils.math.translatePercentage("20%", this.width, true);
		this.attackerHeight = utils.math.translatePercentage("30%", this.height, true);
		this.attackerX = utils.math.translatePercentage("-20%", this.width, true);
		this.attackerY = [];
		for (var i = 0, numPlains = this.boundaryPlains.length; i < numPlains; ++i) {
			this.attackerY[i] = utils.math.translatePercentage((80-(i*3))+"%", this.height, true);
		}
		this.attackerSprite = new GameSprite(this.game, {
			name:		"attacker",
			img:		this.options.images.attacker,
			numFrames:	11,
			delay:		5,
			frames:	{
				walking:	[0,1,2],
				dragging:	[3,4],
				falling:	[5],
				lying:		[6,7,6,6,6,6,6,6,6,6,5],
				striking:	[8,9],
				dead:		[6,7,10,10,10,10,10,10,10,10,10]	
			},
			sheetWidth:		this.options.sizes.attackerSprite.width,
			sheetHeight:	this.options.sizes.attackerSprite.height,
			audio:			this.options.audio.attacker
		});
		
		//  Save the initial wall health
		this.wallHealth = this.options.damage.wallHealth;
		this.wallHealthHalf = this.wallHealth / 2;
		
		//  Create crack image
		this.buildingDamage = {
			crackImg:	new Image(),
			holeImg:	new Image(),
			x:			utils.math.translatePercentage("82.5%", this.width, true),
			y:			utils.math.translatePercentage("42.5%", this.height, true),
			width:		utils.math.translatePercentage("20%", this.width, true),
			height:		utils.math.translatePercentage("50%", this.height, true)
		};
		this.buildingDamage.crackImg.src = this.options.images.levels.crack;
		this.buildingDamage.holeImg.src = this.options.images.levels.hole;
		
		//  Damage bar
		this.damageBarMask = $(this.options.ids.damage).getElement(utils.css.strToClass(this.options.classes.mask));
		
		//  Create the cliff image
		var tmp = new Image();
		tmp.src = this.options.images.levels.cliff;
		this.cliffImg = {
			img:	tmp,
			x:		utils.math.translatePercentage("60%", this.width, true),
			y:		utils.math.translatePercentage("80%", this.height, true),
			width:	utils.math.translatePercentage("40%", this.width, true),
			height:	utils.math.translatePercentage("20%", this.height, true)
		};
		
		//  Queue up the background music
		this.options.audio.background = this.options.audio.level.background;
		
		//  Load up button audio
		this.game.loadSound("woosh", this.options.audio.start.woosh);
		this.game.loadSound("btn-click", this.options.audio.level.button);
		this.game.loadSound("btn-compromise", this.options.audio.level.btnCompromise);
		this.game.loadSound("btn-disallowed", this.options.audio.level.btnDisallowed);
		this.game.loadSound("btn-enable", this.options.audio.level.btnEnabled);
		this.game.loadSound("hit", this.options.audio.level.wallHit);
		this.game.loadSound("btn-cliff", this.options.audio.level.cliff);
		this.game.loadSound("crack", this.options.audio.level.crack);
		this.game.loadSound("break", this.options.audio.level.hole);
		this.game.loadSound("foot", this.options.audio.level.foot);
		
		//  Add foot sprite
		this.footWidth = utils.math.translatePercentage("90%", this.width, true);
		this.footHeight = utils.math.translatePercentage("100%", this.height, true);
		this.footX = 0;
		this.footY = utils.math.translatePercentage("-100%", this.height, true);
		this.footSprite = new GameSprite(this.game, {
			name:		"foot",
			img:		this.options.images.levels.foot,
			numFrames:	1,
			delay:		0,
			frames:	{
				default:	[0]
			},
			sheetWidth:		this.options.sizes.footSprite.width,
			sheetHeight:	this.options.sizes.footSprite.height
		});
		
		//  Create a pause overlay
		this.overlay = new Element("div");
		this.overlay.addClass(this.options.classes.overlay);
		this.obj.appendChild(this.overlay);
		
	},
	
	//  Run the game
	run: function() {
		
		//  Play button sound
		this.game.playSound("woosh");
		
		//  Close the menu screen
		logger.log("run game");
		this.menuObj.removeClass(this.options.classes.open);
		this.obj.addClass(this.options.classes.running);
		this.obj.removeClass(this.options.classes.paused);
		
		//  Set the running flag
		this.running = true;
		
		//  Stop the background audio from start screen and start the level music
		this.game.startScreen.stopBackgroundAudio();
		this.startBackgroundAudio();
		
		//  Generate the first attacker
		this.generateAttacker();
		
		return false;
	
	},
	
	//  Toggle pause
	togglePause: function() {
		if (this.running && !this.gameOver) {
			this.game.playSound("woosh");
			if (this.paused) {
				this.resume();
			} else {
				this.pause();
			}
		}
		return false;
	},
	
	//  Pause the game
	pause: function() {
		logger.log("pause game");
		this.paused = true;
		this.obj.addClass(this.options.classes.paused);
		this.pauseObj.addClass(this.options.classes.down);
		this.menuObj.addClass(this.options.classes.open);
	},
	
	//  Resume the game
	resume: function() {
		this.paused = false;
		this.obj.removeClass(this.options.classes.paused);
		this.pauseObj.removeClass(this.options.classes.down);
		this.menuObj.removeClass(this.options.classes.open);
	},
	
	//  Stop the game
	stop: function() {
		logger.log("stop game");
		this.running = false;
		this.obj.removeClass(this.options.classes.running);
		return false;
	},
	
	//  Restart
	restart: function() {
		window.location.reload();
	},
	
	//  Add entity
	addEntity: function(options, sprite) {
		
		//  If no ID was passed, just use the next available slot
		if (!options.id) {
			options.id = ++this.lastObjId;	
		}
		
		logger.log("add entity: " + options.id);
		
		//  Create the game entity
		this.entities[options.id] = new ExpirableGameEntity(this.canvasLayers[options.plain-1], sprite, options);
		if (this.options.useWorker) {
			this.worker.postMessage({cmd: 'addDynamicBody', 'options': this.entities[options.id].getBodyProperties()});
		} else {
			this.physics.addDynamicBody(this.entities[options.id].getBodyProperties());
		}
		
		return options.id;
		
	},
	
	//  Generate a new attacker
	generateAttacker: function() {
		
		//  If the game is still running, spawn another attacker at a random interval
		if (this.running && !this.paused && !this.gameOver) {
		
			//  Add a dynamic body
			var trackNum = Number.random(1, this.options.world.numPlains);
			this.boundaryPlains[trackNum-1].entities.push(
				this.addEntity({
					x:			this.attackerX,
					y:			this.attackerY[trackNum-1],
					rotate:		false,
					group:		(-1*trackNum),
					state:		"walking",
					width:		this.attackerWidth,
					height:		this.attackerHeight,
					maxHealth:	this.options.damage.attackerHealth,
					health:		this.options.damage.attackerHealth,
					plain:		trackNum
				}, this.attackerSprite)
			);
			
			logger.log("generate attacker: track " + trackNum);
			
			//  Get a random interval
			var interval = Number.random(this.options.timing.attacker.addIntervalMin, this.options.timing.attacker.addIntervalMax);
			
			//  Initialize a new attacker at the random interval
			this.nextAttackerTick = this.ticker + interval;
			logger.log("generate attacker in " + interval + " ticks");
			
			//  Decrease the interval range next time (to increase difficulty progressively)
			if (this.options.timing.attacker.addIntervalMin > this.options.timing.attacker.addIntervalBasel) {
				this.options.timing.attacker.addIntervalMin = this.options.timing.attacker.addIntervalMin + this.options.timing.attacker.addIntervalStep;
			} else {
				this.options.timing.attacker.addIntervalMin = this.options.timing.attacker.addIntervalBase;	
			}
			if (this.options.timing.attacker.addIntervalMax > this.options.timing.attacker.addIntervalBase) {
				this.options.timing.attacker.addIntervalMax = this.options.timing.attacker.addIntervalMax + this.options.timing.attacker.addIntervalStep;
			} else {
				this.options.timing.attacker.addIntervalMax = this.options.timing.attacker.addIntervalBase;	
			}
			
		}
		
	},
	
	//  Update the game loop
	update: function() {
		
		//  Only proceed with the animation if the game is running and is not paused
		if (!this.paused && this.running) {
			
			//  Clear the canvases
			this.ctx.clearRect(0, 0, this.width, this.height);
			for (var i = 0, numLayers = this.canvasLayers.length; i < numLayers; ++i) {
				this.canvasLayers[i].clearRect(0, 0, this.width, this.height);
			}
			
			//  Generate a new attacker if it's time
			if ((this.ticker > this.nextAttackerTick) && !this.gameOver) {
				this.generateAttacker();	
			}
			
			//  Update the box2d world to get body positions
			if (this.options.useWorker) {
				this.worker.postMessage({cmd: 'update', x: this.input.x, y: this.input.y});
			} else {
				this.physics.update(this.input.x, this.input.y);
			}
			
			//  If the cliff is deployed, draw it
			if (this.cliffDeployed) {
				this.ctx.drawImage(this.cliffImg.img, this.cliffImg.x, this.cliffImg.y, this.cliffImg.width, this.cliffImg.height);
			}
			
			//  If the wall is broken, draw the hole
			if (this.wallBroken) {
				this.ctx.drawImage(this.buildingDamage.holeImg, this.buildingDamage.x, this.buildingDamage.y, this.buildingDamage.width, this.buildingDamage.height);
			
			//  If the wall is cracked, draw the crack
			} else if (this.wallCracked) {
				this.ctx.drawImage(this.buildingDamage.crackImg, this.buildingDamage.x, this.buildingDamage.y, this.buildingDamage.width, this.buildingDamage.height);
			}
			
			//  Loop through boundary plains and draw sprites in layer order
			this.registerWallHits = (!this.wallBroken && !this.cliffDeployed && ((this.ticker % (this.attackerSprite.frames.striking.length * this.attackerSprite.delay)) == 0));
			this.numWallHits = 0;
			for (var i = this.boundaryPlains.length-1; i > -1; --i) {
				for (var n = 0, numEntities = this.boundaryPlains[i].entities.length; n < numEntities; ++n) {
					this.updateSprite(this.boundaryPlains[i].entities[n]);
				}
			}
			
			//  Play the wall hit sound and change wall damage if anyone is striking
			if (this.registerWallHits && (this.numWallHits > 0)) {
				this.game.playSound("hit");
				this.changeWallHealth(this.options.damage.wallAttackDamage * this.numWallHits);
			}
			
			//  Increment ticker
			++this.ticker;
		
		}
		
	},
	
	//  Update the sprite
	updateSprite: function(i, properties) {
		
		//  Only proceed if the entity still exists
		if (this.entities[i]) {
			
			//  Get the body
			if (this.options.useWorker) {
				this.worker.postMessage({cmd: 'getBodyById', id: this.entities[i].id});
				this.worker.postMessage({cmd: 'getBodyData', id: this.entities[i].id, key: "state"});
				var body = this.workerBody;
				var bodyState = this.workerBodyState;
				var bodyHealth = this.workerBodyHealth;
			} else {
				var body = this.physics.getBodyById(this.entities[i].id);
				var bodyData = this.physics.getBodyData(body);
			}
			
			//  Update the entity's state
			this.entities[i].state = bodyData.state;
			
			//  If the body is flagged for removal, remove it
			if ((bodyData.state == "removed") || !bodyData.state) {
				logger.log("remove body " + i);
				utils.array.removeElement(this.entities, i);
			
			//  Otherwise redraw it
			} else {
				
				//  If the attacker is dead, change the score
				if ((bodyData.state == "dead") && !this.entities[i].isScored) {
					//logger.log("dead");
					var bonusPoints = parseInt((bodyData.health * -1) * (this.options.scoring.pointsPerKill / this.options.scoring.bonusKillFactor));	
					this.changeScore(this.options.scoring.pointsPerKill + bonusPoints);
					this.entities[i].isScored = true;
				
				//  ... Or else if the attacker is striking, decrease the health of the wall, but only once per frame sequence
				} else if ((bodyData.state == "striking") && this.registerWallHits) {
					++this.numWallHits;
				}
			
				//  Figure out the position of the body
				var tmpPos = body.GetPosition();
				var pos = {
					x: (tmpPos.x * this.options.world.scale) - (this.entities[i].width / 2),
					y: (tmpPos.y * this.options.world.scale) - (this.entities[i].height / 2)
				};
					
				//  Update the entity
				this.entities[i].update(pos);
	
			}
		
		}

	},
	
	//  Handle the compromise action
	handleCompromise: function() {
		if (this.running && !this.paused && !this.gameOver) {
			if (this.compromiseEnabled) {
				this.changeScore(-1*this.options.scoring.compromiseCost);
				this.changeWallHealth(this.options.damage.compromiseRepair);
				this.game.playSound("btn-compromise");
				this.compromiseObj.addClass(this.options.classes.down);
				this.compromiseEnabled = false;
			} else {
				this.game.playSound("btn-disallowed");
			}
		}
		return false;
	},
	
	//  Toggle compromise button
	toggleCompromiseButton: function() {
		if (this.canUseCompromise() && !this.compromiseEnabled) {
			this.game.playSound("btn-enabled");
			this.compromiseObj.removeClass(this.options.classes.down);
			this.compromiseEnabled = true;
		} else if (!this.canUseCompromise() && this.compromiseEnabled) {
			this.compromiseObj.addClass(this.options.classes.down);
			this.cliffEnabled = false;
		}
	},
	
	//  Whether or not the user can use compromise
	canUseCompromise: function() {
		return 	((this.score >= this.options.scoring.compromiseCost) && ((this.options.damage.wallHealth - this.wallHealth) >= this.options.damage.compromiseRepair));
	},
	
	//  Handle the fiscal cliff action
	handleCliff: function() {
		
		if (this.running && !this.paused && !this.gameOver) {
		
			//  If the user is allowed to deploy
			if (this.cliffEnabled) {
				
				//  Start the fiscal cliff
				this.startCliff();
			
			//  Or else just play the disallowed sound
			} else {
				this.game.playSound("btn-disallowed");
			}
		
		}
		
		return false;
	
	},
	
	//  Toggle cliff button
	toggleCliffButton: function() {
		if (this.canUseCliff() && !this.cliffEnabled) {
			this.game.playSound("btn-enabled");
			this.cliffObj.removeClass(this.options.classes.down);
			this.cliffEnabled = true;
		} else if (!this.canUseCliff() && this.cliffEnabled) {
			this.cliffObj.addClass(this.options.classes.down);
			this.cliffEnabled = false;
		}
	},
	
	//  Whether or not the user can use cliff
	canUseCliff: function() {
		return 	(this.score >= this.options.scoring.cliffCost);
	},
	
	//  Start cliff
	startCliff: function() {
		
		//  Set the fiscal cliff flag
		this.cliffDeployed = true;
		
		//  Change the score
		this.changeScore(-1*this.options.scoring.cliffCost);
		
		//  Play the crack audio
		this.game.playSound("btn-cliff");
		
		//  Move bottom boundaries to allow attackers to fall
		for (var i = 0, numPlains = this.boundaryPlains.length; i < numPlains; ++i) {
			var pos = this.getBodyPosition(this.boundaryPlains[i].bottom);
			this.boundaryPlains[i].previousBottomX = pos.x;
			this.setBodyPosition(this.boundaryPlains[i].bottom, "-83%", false);
		}
		
		//  Anyone that's striking needs to be falling to their death now
		var bodies = this.physics.getBodiesByProperty("state", "striking");
		for (var i = 0, numBodies = bodies.length; i < numBodies; ++i) {
			bodies[i].SetAwake(true);
			this.physics.setBodyState(bodies[i], "falling");
			setTimeout(function() {
				if (bodies[i]) {
					this.physics.killBody(bodies[i]);
					this.changeScore(this.options.scoring.pointsPerKill);
				}
			}.bind(this), this.options.timing.attacker.removeDelay);
		}
		
		//  Disable the button for now
		this.cliffObj.addClass(this.options.classes.down);
		
		//  End the cliff in the amount of time set in the options
		this.endCliff.delay(this.options.timing.game.cliffDuration, this);
		
		//  Set the flag
		this.cliffEnabled = false;
		
	},
	
	//  End the cliff
	endCliff: function() {
		
		logger.log("end fiscal cliff");
		
		//  Play the crack sound again
		this.game.playSound("btn-cliff");
		
		//  Move the floor back to where it was
		for (var i = 0, numPlains = this.boundaryPlains.length; i < numPlains; ++i) {
			//this.setBodyPosition(this.boundaryPlains[i].bottom, this.boundaryPlains[i].previousBottomX, false); // FIX LATER
			this.setBodyPosition(this.boundaryPlains[i].bottom, "-51%", false);
		}
		
		//  Reset the flag
		this.cliffDeployed = false;
		
	},
	
	//  Handle the filibuster action
	handleFilibuster: function() {
		if (this.running && !this.paused && !this.gameOver) {
			if (this.filibusterEnabled) {
				
				//  Change the score
				this.changeScore(-1*this.options.scoring.filibusterCost);
				
				//  Set the foot hit floor flag to false
				this.footHitGround = false;
				
				//  Create filibuster body
				this.foot = this.addEntity({
					x:			this.footX,
					y:			this.footY,
					rotate:		false,
					group:		-1,
					state:		"default",
					width:		this.footWidth,
					height:		this.footHeight,
					plain:		1
				}, this.footSprite);
				this.boundaryPlains[0].entities.push(this.foot);
				
				//  Disable the filibuster button
				this.filibusterObj.addClass(this.options.classes.down);
				this.filibusterEnabled = false;
			
			} else {
				this.game.playSound("btn-disallowed");
			}
			
		}
		return false;
	},
	
	//  Toggle filibuster button
	toggleFilibusterButton: function() {
		if (this.canUseFilibuster() && !this.filibusterEnabled) {
			this.game.playSound("btn-enabled");
			this.filibusterObj.removeClass(this.options.classes.down);
			this.filibusterEnabled = true;
		} else if (!this.canUseFilibuster() && this.filibusterEnabled) {
			this.filibusterObj.addClass(this.options.classes.down);
			this.cliffEnabled = false;
		}
	},
	
	//  Whether or not the user can use filibuster
	canUseFilibuster: function() {
		return 	(this.score >= this.options.scoring.filibusterCost);
	},
	
	//  Change the score
	changeScore: function(num, id) {
		if (!id || (this.scoredEntities.indexOf(id) === -1)) {
			this.score = this.score + num;
			this.scoreNumObj.set("text", this.score);
			this.toggleCompromiseButton();
			this.toggleCliffButton();
			this.toggleFilibusterButton();
			if (id) {
				this.scoredEntities.push(id);	
			}
		}
	},
	
	//  Change wall health
	changeWallHealth: function(num) {
		
		//  Only keep processing if the game isn't already over
		if (!this.gameOver) { 
		
			//  Adjust the wall health
			this.wallHealth = this.wallHealth + num;
			logger.log("wall health: " + this.wallHealth);
			
			//  Change the health display
			var barLength = this.wallHealth;
			if (this.wallHealth < 0) {
				barLength = 0;
			} else if (this.wallHealth > this.options.damage.wallHealth) {
				barLength = this.options.damage.wallHealth;
			}
			this.damageBarMask.setStyle("width", (this.options.damage.wallHealth - barLength) + "%");
			
			//  Toggle compromise button since it depends on wall health (others don't)
			this.toggleCompromiseButton();
			
			//  If the wall is broken, game over
			if (this.wallHealth <= 0) {
				this.endGame();
			} else if ((this.wallHealth < this.wallHealthHalf) && !this.wallCracked) {
				this.wallCracked = true;
				this.game.playSound("crack");
				logger.log("wall half broken!");
			} else if ((this.wallHealth >= this.wallHealthHalf) && this.wallCracked) {
				this.wallCracked = false;
			}
			
			this.toggleCompromiseButton();
			this.toggleCliffButton();
			this.toggleFilibusterButton();
		
		}
		
	},
	
	//  End the game
	endGame: function() {
		
		//  Set flags
		logger.log("game over!");
		this.gameOver = true;
		this.wallBroken = true;
		this.disableInput = true;
		
		//  Play the big crack sound
		this.game.playSound("break");
		
		//  Move right boundaries to let attackers walk in
		for (var i = 0, numPlains = this.boundaryPlains.length; i < numPlains; ++i) {
			this.setBodyPosition(this.boundaryPlains[i].right, false, "-140%");
		}
		
		//  Set the attackers to walking
		for (var i = 0, numEntities = this.entities.length; i < numEntities; ++i) {
			if (this.entities[i]) {
				var body = this.physics.getBodyById(this.entities[i].id);
				this.physics.setBodyState(body, "walking");
			}
		}
		
		//  Show the end screen
		this.obj.addClass(this.options.classes.end);
		this.menuObj.addClass.delay(this.options.timing.game.endGameDelay, this.menuObj, this.options.classes.open);
		
		//  Change the music up
		this.stopBackgroundAudio();
		this.game.startScreen.startBackgroundAudio();
		
		
	},
	
	//  Handle collision
	handleCollision: function(c, i) {
		
		//  Figure out the dynamic and static body
		if (c.m_fixtureA.GetBody().GetType() == this.bodyTypes["dynamic"]) {
			var dynamic = c.m_fixtureA;
			var static = c.m_fixtureB;
		} else {
			var dynamic = c.m_fixtureB;
			var static = c.m_fixtureA;	
		}
		
		//  Get some additional body info
		var size = static.GetShape().m_vertices[0];
		var pos = static.GetBody().GetPosition();
		var body = dynamic.GetBody();
		var data = this.getBodyData(body);
		
		//  If this is the foot and it hit the ground
		if (this.getBodyId(body) == BMZ.levelScreen.foot) {
			
			if (!BMZ.levelScreen.footHitGround && (Math.abs(size.x) > Math.abs(size.y)) && (pos.y > this.bottomHalfThreshold)) {
				
				//  Play the foot squish
				BMZ.playSound("foot");
				
				//  Kill all other entities immediately
				for (var i = BMZ.levelScreen.boundaryPlains.length-1; i > -1; --i) {
					for (var n = 0, numEntities = BMZ.levelScreen.boundaryPlains[i].entities.length; n < numEntities; ++n) {
						if (BMZ.levelScreen.boundaryPlains[i].entities[n] != BMZ.levelScreen.foot) {
							this.killBody(BMZ.levelScreen.boundaryPlains[i].entities[n], this.options.timing.attacker.removeDelay);
							//this.game.levelScreen.changeScore(this.options.scoring.pointsPerKill);
						}
					}
				}
				
				//  Set the flag to indicate we're on the ground
				BMZ.levelScreen.footHitGround = true;
				
				//  Bounce foot back up
				setTimeout(function() {
					body.SetAwake(true);
					body.SetLinearVelocity(new b2Vec2(0, -100));
				}.bind(this), this.options.timing.attacker.removeDelay);
			
			//  Or if the foot hit the ceiling after coming back up, remove it
			} else if (BMZ.levelScreen.footHitGround && (Math.abs(size.x) > Math.abs(size.y)) && (pos.y < this.bottomHalfThreshold)) {
				this.removeBody(body);
				BMZ.levelScreen.foot = false;
				BMZ.levelScreen.footHitGround = false;
			}
			
		} else {
		
			//  If the entity hit the ground ...
			if ((data.state == "falling") && (Math.abs(size.x) > Math.abs(size.y)) && (pos.y > this.bottomHalfThreshold)) {
				
				//  Log the force
				logger.log("force: " + i.normalImpulses[0]);
				
				//  Figure out and set the damage to the body's health
				//var damage = i.normalImpulses[0] / this.options.damage.attackerCollisionFactor;
				var damage = i.normalImpulses[0] / ((BMZ.levelScreen.width * BMZ.levelScreen.height) / this.options.damage.attackerCollisionFactor);
				var oldHealth = data.health;
				var newHealth = oldHealth - damage;
				this.setBodyData(body, "health", newHealth);
				
				//  If the health is at or below zero, change state to 'dead' and remove in 1 second
				if (newHealth <= 0) {
					this.killBody(body, this.options.timing.attacker.removeDelay);
				
				//  Otherwise set the state to 'lying', then 'walking' in 1 second
				} else {
					this.setBodyState(body, "lying");
					setTimeout(function() {
						if (this.getBodyState(body) == "lying") {
							this.setBodyState(body, "walking");
						}
					}.bind(this), this.options.timing.attacker.getUpDelay);
				}
	
			}
			
			//  If the entity hit the wall to the right, change state to striking (or falling if the cliff is deployed)
			if ((data.state == "walking") && (Math.abs(size.y) > Math.abs(size.x)) && (pos.x > this.rightHalfThreshold)) {
				
				//  If the fiscal cliff is deployed, make the attacker fall and then die
				if (BMZ.levelScreen.cliffDeployed) {
					this.setBodyState(body, "falling");
					setTimeout(function() {
						if (body) {
							this.killBody(body);
							BMZ.levelScreen.changeScore(this.options.scoring.pointsPerKill);
						}
					}.bind(this), this.options.timing.attacker.removeDelay);
					
				//  Or else set his state to striking the wall
				} else {
					this.setBodyState(body, "striking");
				}
				
			}
		
		}
		
	},
	
	//  Handle a resize
	handleWindowResize: function() {
		logger.log("window was resized.");
		//this.game.restart.delay(this.options.timing.game.resizeWindowDelay, this.game, "Resizing the game window requires a reload.");
	}
	
	/*
	//  Handle a resize event
	handleWindowResize: function() {
		
		//  Only proceed if we aren't already resizing
		if (!this.resizing) {
			
			//  Set the resize flag to true
			this.resizing = true;
			
			//  Set the screen size
			this.previousWidth = this.width;
			this.previousHeight = this.height;
			this.setSize();
			
			//  Set the canvas sizes
			this.resizeCanvases();
	
			//  Redraw bodies
			this.redrawBodies();
			
			//  Set the resize flag to false
			this.resizing = false;
		
		}
	
	},
	
	//  Redraw bodies
	redrawBodies: function() {
		
		//  Set width and height ratios
		var xRatio = this.previousWidth / this.width;
		var yRatio = this.previousHeight / this.height;
		
		//  Loop through bodies
		var bodies = this.physics.world.GetBodyList();
		for (var body = this.physics.world.GetBodyList(); body; body = body.GetNext()) {
			
			//  Get the position and size
			var pos = this.getBodyPosition(body);
			var size = this.getBodySize(body);
			
			//  Set the new position
			this.setBodyPosition(body, pos.x / xRatio, pos.y / yRatio);
			
			//  Set the new size
			this.setBodySize(body, size.width / xRatio, size.height / yRatio);
				
		}
	}
	*/
	
});