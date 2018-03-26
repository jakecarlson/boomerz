var GameLevelScreen = new Class({

	Extends:	GameScreen,
	Implements: Options,
	
	//  Options
	options: {
		
		//  IDs
		ids:	{
			obj:	'screen',
			canvas:	'game'
		},
		
		//  Classes
		classes: {
			inputActive:	"inputActive"
		},
		
		//  World details
		world:	{
			
			//  Basic physics
			scale:				100,
			gravity:			100,
			
			//  Refresh rate / performance
			refresh:			1/60,
			adaptiveRefresh:	true,
			useWorker: 			false,
			workerScript:		'lib/workerGameLoop.js',
			
			//  Scoring
			pointsPerKill:	100,
			
			//  Fixtures
			fixtures:	{
				density:		100,
				friction:		1,
				restitution:	0	
			},	
		
			//  Loop actions
			loopActions:	[
				
				{
					type:			"input",
					action:			"drag",
					dragState:		"dragging",
					dropState:		"falling"
				}
		
			],
			
			//  Events
			events:		{
		
				collision:	{
					postSolve:	false	
				}
				
			}
		
		},
		
		//  Images
		images: {
			background:	false
		}
		
	},
	
	//  Properties
	canvasLayers: [],
	bodies: [],
	entities: [],
    worker: null,
    loop: null,
	mouse:	{
		x:	undefined,
		y:	undefined
	},
	lastObjId:		0,
	score:			0,
	boundaryPlains: [],
	running:		false,
	paused:			false,
	gameOver:		false,
	ticker:			0,
	disableInput:	false,
	
	//  Initialize
	initialize: function(game, options) {
    
		//  Call parent constructor
		this.parent(game, options);
		
		//  Set objects
    	this.canvas = $(this.options.ids.canvas);
		this.ctx = this.canvas.getContext("2d");
		
		//  Attach event listeners for mouse input
		document.addEventListener(this.events.dragStart, this.handleInputStart.bind(this), true);
		document.addEventListener(this.events.dragEnd, this.handleInputEnd.bind(this), true);
		
		//  Set the animation loop mechanism
		if (this.options.world.useWorker) {
			this.worker = new Worker(this.options.world.workerScript);
			this.worker.postMessage({cmd: 'setCanvasSize', width: this.width, height: this.height});
			this.onmessage = function(e) {
				logger.log(e);
			};
		} else {
			this.physics = new GamePhysics(this.options);
			this.physics.setCanvasSize(this.width, this.height);
		}
	
		//  Start the game loop
		//this.interval = this.update.periodical(1000/60, this);
		//requestAnimationFrame(this.update.bind(this));
		this.runAnimationLoop();
		
	},
	
	//  Run animation loop
	runAnimationLoop: function() {
		//if (this.running) {
			requestAnimationFrame(this.runAnimationLoop.bind(this));
      		this.update();
		//}
	},
	
	//  Create multiple boundary plains
	createBoundaryPlains: function(options) {
		
		//  Set defaults
		if (!options) {
			options = {};	
		}
		if (options.top == undefined) {
			options.top = 0;	
		}
		if (options.left == undefined) {
			options.left = 0;	
		}
		if (options.right == undefined) {
			options.right = "100%";	
		}
		if (options.bottom == undefined) {
			options.bottom = "100%";	
		}
		if (options.thickness == undefined) {
			options.thickness = "1%";	
		}
		if (options.stepX == undefined) {
			options.stepX = "-5%";	
		}
		if (options.stepY == undefined) {
			options.stepY = "-5%";	
		}
		if (options.group == undefined) {
			options.group = 1;	
		}
		if (options.stepGroup == undefined) {
			options.stepGroup = 1;	
		}
		if (options.num == undefined) {
			options.num = 3;	
		}
		
		//  Set the z-index of the current canvas to the number of plains + 1
		this.canvas.setStyles({
			"position":	"relative",
			"z-index":	0
		});
		
		//  Width / height calculations
		var top = utils.math.translatePercentage(options.top, this.height);
		var left = utils.math.translatePercentage(options.left, this.width);
		var right = utils.math.translatePercentage(options.right, this.width);
		var bottom = utils.math.translatePercentage(options.bottom, this.height);
		var stepX = utils.math.translatePercentage(options.stepX, this.width);
		var stepY = utils.math.translatePercentage(options.stepY, this.height); 
		
		//  Loop through pass number of plains and create a boundary set for each one
		var plains = [];
		for (var i = 0; i < options.num; ++i) {
			
			//  Create a new canvas element for this layer
			var canvas = new Element("canvas");
			canvas.width = this.canvas.width;
			canvas.height = this.canvas.height;
			var zIndex = options.num-i;
			if (stepY > 0) {
				zIndex = i+1;
			}
			canvas.setStyles({
				"position": "absolute",
				"z-index":	zIndex,
				"top":		0,
				"left":		0
			});
			this.obj.appendChild(canvas);
			this.canvasLayers[i] = canvas.getContext("2d");
			
			//  Create the plain in physics engine
			plains.push(this.createBoundaryPlain({
				top:		top + (stepY * i),
				left:		left + (stepX * i),
				right:		right + (stepX * i),
				bottom:		bottom + (stepY * i),
				thickness:	options.thickness,
				group:		options.group + (options.stepGroup * i)
			}));
			
		}
		
		return plains;
		
	},
	
	//  Create boundaries based one 4 coordinates and barrier width
	createBoundaryPlain: function(options) {
		
		//  Set defaults
		if (!options) {
			options = {};	
		}
		if (options.top == undefined) {
			options.top = 0;	
		}
		if (options.left == undefined) {
			options.left = 0;	
		}
		if (options.right == undefined) {
			options.right = "100%";	
		}
		if (options.bottom == undefined) {
			options.bottom = "100%";	
		}
		if (options.thickness == undefined) {
			options.thickness = "1%";	
		}
		if (options.group == undefined) {
			options.group = 1;	
		}
		
		//  Width / height calculations
		var thicknessX = utils.math.translatePercentage(options.thickness, this.width);
		var thicknessY = utils.math.translatePercentage(options.thickness, this.height);
		var leftPos = utils.math.translatePercentage(options.left, this.width);
		var rightPos = utils.math.translatePercentage(options.right, this.width);
		var topPos = utils.math.translatePercentage(options.top, this.height);
		var bottomPos = utils.math.translatePercentage(options.bottom, this.height);
		var width = (rightPos - leftPos);
		var height = (bottomPos - topPos);
		
		//logger.log("l:" + leftPos + ", r:" + rightPos + ", t:" + topPos + ", b:" + bottomPos);
		var bodies = {};
		
		//  Ceiling
		bodies.top = this.addBody({
			width:		width + (thicknessX * 3),
			height:		thicknessY,
			x:			leftPos + (width / 2),
			y:			topPos - thicknessY,
			group:		options.group
		});
		
		//  Floor
		bodies.bottom = this.addBody({
			width:		width + (thicknessX * 3),
			height:		thicknessY,
			x:			leftPos + (width / 2),
			y:			bottomPos + thicknessY,
			group:		options.group
		});
		
		//  Left
		bodies.left = this.addBody({
			width:		thicknessX,
			height:		height + (thicknessY * 3),
			x:			leftPos - thicknessX,
			y:			topPos + (height / 2),
			group:		options.group
		});
		
		//  Right
		bodies.right = this.addBody({
			width:		thicknessX,
			height:		height + (thicknessY * 3),
			x:			rightPos + thicknessX,
			y:			topPos + (height / 2),
			group:		options.group
		});
		
		//  Add an array for entities in case we want to store them per plain
		bodies.entities = [];
		
		return bodies;
		
	},
	
	//  Add entity
	addEntity: function(options) {
		if (!options.id) {
			options.id = ++this.lastObjId;	
		}
		logger.log("add entity: " + options.id);
		this.entities[options.id] = new GameEntity(options);
		if (this.options.world.useWorker) {
			this.worker.postMessage({cmd: 'addDynamicBody', 'options': this.entities[options.id].getBodyProperties()});
		} else {
			this.physics.addDynamicBody(this.entities[options.id].getBodyProperties());
		}
		return options.id;
	},
	
	//  Remove entity
	removeEntity: function(id) {
		logger.log("remove entity: " + id);
		this.removeBody(id);
		utils.array.removeElement(this.entities, id);
		for (var i = 0, numPlains = this.boundaryPlains.length; i < numPlains; ++i) {
			this.boundaryPlains[i].erase(id);	
		}
	},
	
	//  Add static body
	addBody: function(options) {
		if (!options.id) {
			options.id = ++this.lastObjId;	
		}
		logger.log("add body: " + options.id);
		if (this.options.world.useWorker) {
			this.worker.postMessage({cmd: 'addKinematicBody', 'options': options});
		} else {
			this.bodies[options.id] = this.physics.addKinematicBody(options);
		}
		return options.id;
	},
	
	//  Remove a static body
	removeBody: function(id) {
		if (this.options.world.useWorker) {
			this.worker.postMessage({cmd: 'removeBody', 'id': id});
		} else {
			this.physics.removeBody(id);
		}
	},
	
	//  Get a body's position
	getBodyPosition: function(id) {
		var size = this.getBodySize(id);
		var pos = this.physics.getBodyPosition(id);
		return {
			x:	pos.x - (size.width),
			y:	pos.y - (size.height)	
		};
	},
	
	//  Set a body's position
	setBodyPosition: function(id, x, y) {
		var size = this.getBodySize(id);
		if (x !== false) {
			x = utils.math.translatePercentage(x, this.width) + size.width;
		}
		if (y !== false) {
			y = utils.math.translatePercentage(y, this.height) + size.height;
		}
		return this.physics.setBodyPosition(id, x, y);
	},
	
	//  Get a body's position
	getBodySize: function(id) {
		return this.physics.getBodySize(id);
	},
	
	//  Set a body's size
	setBodySize: function(id, width, height) {
		return this.physics.setBodySize(id, width, height);
	},
	
	//  Update the game loop
	update: function() {
		if (this.options.world.useWorker) {
			this.worker.postMessage({cmd: 'update', x: this.input.x, y: this.input.y});
		} else {
			this.physics.update(this.input.x, this.input.y);
		}
		if (!this.options.debug) {
			for (var i = 0, numEntities = this.entities.length; i < numEntities; ++i) {
				this.entities[i].updateSprite(this.physics.getBodyById(this.entities[i].id));	
			}
			this.stage.update();
		}
	},
	
	//  Handle mouse move
	handleInputMove: function(e) {
		e.preventDefault();
		if (!this.disableInput) {
			if (this.events.dragMove == "touchmove") {	
				var x = e.touches[0].pageX;
				var y = e.touches[0].pageY;
			} else {
				var x = e.clientX;
				var y = e.clientY;	
			}
			this.input.x = x / this.options.world.scale;
			this.input.y = y / this.options.world.scale;
		}
	},
	
	//  Handle mouse down
	handleInputStart: function(e) {
		if (!this.disableInput) {
			$(document.body).addClass(this.options.classes.inputActive);
			if (this.options.world.useWorker) {
				this.worker.postMessage({cmd:'setInputState', active: true});	
			} else {
				this.physics.setInputState(true);
			}
			this.handleInputMove(e);
			document.addEventListener(this.events.dragMove, this.handleInputMove.bind(this), true);
		}
	},
	
	//  Handle mouse up
	handleInputEnd: function(e) {
		if (!this.disableInput) {
			$(document.body).removeClass(this.options.classes.inputActive);
			document.removeEventListener(this.events.dragMove, this.handleInputMove.bind(this), true);
			if (this.options.world.useWorker) {
				this.worker.postMessage({cmd:'setInputState', active: false});	
			} else {
				this.physics.setInputState(false);
			}
			this.input.x = undefined;
			this.input.y = undefined;
		}
	}
	
});
