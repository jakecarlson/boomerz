//  Set handles for box2d
var	b2Vec2 = Box2D.Common.Math.b2Vec2,
	b2AABB = Box2D.Collision.b2AABB,
	b2BodyDef = Box2D.Dynamics.b2BodyDef,
	b2Body = Box2D.Dynamics.b2Body,
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2ContactListener = Box2D.Dynamics.b2ContactListener,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
	b2DestructionListener = Box2D.Dynamics.b2DestructionListener,
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
	b2Fixture = Box2D.Dynamics.b2Fixture,
	b2MassData = Box2D.Collision.Shapes.b2MassData,
	b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
 	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
	b2World = Box2D.Dynamics.b2World;
	
var self = this;

//  The game loop
function GamePhysics(options) {
	
	//  Set option defaults
	if (!options) {
		options = {};	
	}
	if (options.world == undefined) {
		options.world = {};
		if (options.world.scale == undefined) {
			options.world.scale = 1;	
		}
		if (options.world.gravity == undefined) {
			options.world.gravity = 100;	
		}
		if (options.world.maxForce == undefined) {
			options.world.maxForce = 300;	
		}
		if (options.world.refresh == undefined) {
			options.world.refresh = 1/60;	
		}
		if (options.world.adaptiveRefresh == undefined) {
			options.world.adaptiveRefresh = false;	
		}
	}
	if (options.events == undefined) {
		options.events = {};
		if (options.events.collision == undefined) {
			options.events.collision = {};	
			if (options.events.collision.beginContact == undefined) {
				options.events.collision.beginContact = false;	
			}
			if (options.events.collision.endContact == undefined) {
				options.events.collision.endContact = false;	
			}
			if (options.events.collision.preSolve == undefined) {
				options.events.collision.preSolve = false;	
			}
			if (options.events.collision.postSolve == undefined) {
				options.events.collision.postSolve = false;	
			}
		}
	}
	this.options = options;
	
	//  Initialize properties
	this.input = {
		pVec:	undefined,
		down:	undefined,
		joint:	undefined,
		active:	false
	};
	this.canvasWidth = 0;
	this.canvasHeight = 0;
	this.selectedBody = undefined;
	this.bodyTypes = {
		static:		b2Body.b2_staticBody,
		dynamic:	b2Body.b2_dynamicBody,
		kinematic:	b2Body.b2_kinematicBody
	};
	this.bodies = [];
	this.bodiesToRemove = [];
	
	//  Create the world
	this.world = new b2World(
		new b2Vec2(0, this.options.world.gravity),	//  gravity
		true										//  allow sleep
	);
	
	//  Add a contact listener
	if (this.options.events.collision) {
		this.contactListener = new b2ContactListener;
		if (this.options.events.collision.beginContact) {
			this.contactListener.BeginContact = this.options.events.collision.beginContact.bind(this);
		}
		if (this.options.events.collision.endContact) {
			this.contactListener.EndContact = this.options.events.collision.endContact.bind(this);
		}
		if (this.options.events.collision.preSolve) {
			this.contactListener.PreSolve = this.options.events.collision.preSolve.bind(this);
		}
		if (this.options.events.collision.postSolve) {
			this.contactListener.PostSolve = this.options.events.collision.postSolve.bind(this);
		}
		this.world.SetContactListener(this.contactListener);
	}
	
	//  Initialize fixture / body definitions
	this.fixDef = new b2FixtureDef;
	this.bodyDef = new b2BodyDef;
	
	//  Set debug draw
	if (this.options.debug && (self.document !== undefined)) {
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(document.getElementById(this.options.ids.canvas).getContext("2d"));
		debugDraw.SetDrawScale(this.options.world.scale);
		debugDraw.SetFillAlpha(0.5);
		debugDraw.SetLineThickness(0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(debugDraw);
	}
	
}

//  Add a static body
GamePhysics.prototype.addStaticBody = function(options) {
	options.type = "static";
	options.rotate = false;
	return this.addBody(options);
}

//  Add a dynamic body
GamePhysics.prototype.addDynamicBody = function(options) {
	options.type = "dynamic";
	return this.addBody(options);	
}

//  Add a kinematic body
GamePhysics.prototype.addKinematicBody = function(options) {
	options.type = "kinematic";
	return this.addBody(options);	
}

//  Add a body to the world
GamePhysics.prototype.addBody = function(options) {
	
	//  Set option defaults
	if (!options) {
		options = {};	
	}
	if (options.id == undefined) {
		options.id = this.bodies.length+1;
	}
	if (options.type == undefined) {
		options.type = "dynamic";	
	}
	if (options.density == undefined) {
		options.density = 100;	
	}
	if (options.friction == undefined) {
		options.friction = 1;	
	}
	if (options.restitution == undefined) {
		options.restitution = 0;	
	}
	if (options.x == undefined) {
		options.x = 0;	
	}
	if (options.y == undefined) {
		options.y = "90%";	
	}
	if (options.width == undefined) {
		options.width = "100%";	
	}
	if (options.height == undefined) {
		options.height = "10%";	
	}
	if (options.rotate == undefined) {
		options.rotate = true;	
	}
	if (options.group == undefined) {
		options.group = 1;	
	}
	
	//  Set dimensions and location of body
	var width = utils.math.translatePercentage(options.width, this.canvasWidth) / 2;
	var height = utils.math.translatePercentage(options.height, this.canvasHeight) / 2;
	var x = utils.math.translatePercentage(options.x, this.canvasWidth);
	if (x == 0) {
		x = width;	
	}
	var y = utils.math.translatePercentage(options.y, this.canvasHeight);
	if (y == 0) {
		y = height;
	}
	
	//  Create the fixture definition
	this.fixDef.density = options.density;
	this.fixDef.friction = options.friction;
	this.fixDef.restitution = options.restitution;
	this.fixDef.filter.group = options.group;
	if (options.group >= 0) {
		this.fixDef.filter.categoryBits = Math.pow(2, Math.abs(options.group));
	} else {
		this.fixDef.filter.categoryBits = Math.pow(2, Math.abs(options.group)+10);
		this.fixDef.filter.maskBits = Math.pow(2, Math.abs(options.group));
	}
	this.fixDef.shape = new b2PolygonShape;
	this.fixDef.shape.SetAsBox(width / this.options.world.scale, height / this.options.world.scale);
	
	//  Create the body definition
	this.bodyDef.type = this.bodyTypes[options.type];
	this.bodyDef.fixedRotation = !options.rotate;
	this.bodyDef.position.x = x / this.options.world.scale;
	this.bodyDef.position.y = y / this.options.world.scale;
	
	//  Add the body to the world
	this.bodies[options.id] = this.world.CreateBody(this.bodyDef).CreateFixture(this.fixDef).GetBody();
	var userData = {
		id:		options.id,
		width:	width,
		height:	height
	};
	
	//  Save initial state if one is passed
	if (options.state != undefined) {
		userData.state = options.state;
	}
	
	//  Save the health if one is defined
	if (options.health != undefined) {
		userData.health = options.health;	
	}
	/*
	//  Save the stepX if one is defined
	if (options.stepX != undefined) {
		userData.stepX = options.stepX;	
	}
	
	//  Save the stepY if one is defined
	if (options.stepY != undefined) {
		userData.stepY = options.stepY;	
	}
	*/
	this.bodies[options.id].SetUserData(userData);
	
	//  Return the body
	return options.id;
	
}

//  Remove a body
GamePhysics.prototype.removeBody = function(body) {
	if (typeof body == "number") {
		var tmpBody = this.bodies[body];
		if (tmpBody) {
			delete this.bodies[tmpBody];
			body = tmpBody;
		} else {
			body = this.getBodyById(body);	
		}
	}
	if (this.bodiesToRemove.indexOf(body) === -1) {
		this.bodiesToRemove.push(body);
	}
}

//  Set body data non-destructively
GamePhysics.prototype.setBodyData = function(body, key, val) {
	if (typeof body == "number") {
		body = this.bodies[body];
	}
	if (body) {
		var tmpData = body.GetUserData();
		if (typeof key == "string") {
			tmpData[key] = val;
			logger.log("body " + tmpData.id + ": " + key + ": " + val);
		} else if (typeof key == "object") {
			for (i in key) {
				tmpData[i] = key[i];
				logger.log("body " + tmpData.id + ": " + i + ": " + key[i]);
			}
		}
		body.SetUserData(tmpData);
	}
}

//  Set body state
GamePhysics.prototype.setBodyState = function(body, state) {
	this.setBodyData(body, "state", state);
}

//  Get body state
GamePhysics.prototype.getBodyState = function(body) {
	return this.getBodyData(body, "state");	
}

//  Get body data -- if no key provided, return all data
GamePhysics.prototype.getBodyData = function(body, key) {
	if (typeof body == "number") {
		body = this.bodies[body];
	}
	if (body) {
		var tmpData = body.GetUserData();
		if (key) {
			return tmpData[key];
		} else {
			return tmpData;	
		}
	} else {
		return false;	
	}
}

//  Get body by property
GamePhysics.prototype.getBodyByProperty = function(property, value) {
	var body = this.world.GetBodyList();
	while (body != null) {
		var data = body.GetUserData();
		if ((data != null) && (data[property] == value)) {
			break;	
		}
		body = body.GetNext();
	}
	return body;
}

//  Get body by id
GamePhysics.prototype.getBodyById = function(id) {
	return this.getBodyByProperty("id", id);
}

//  Get bodies by property
GamePhysics.prototype.getBodiesByProperty = function(property, value) {
	var tmpBodies = [];
	var body = this.world.GetBodyList();
	while (body != null) {
		var data = body.GetUserData();
		if ((data != null) && (data[property] == value)) {
			tmpBodies.push(body);
		}
		body = body.GetNext();
	}
	return tmpBodies;
}

//  Get the body ID
GamePhysics.prototype.getBodyId = function(body) {
	if (typeof body == "number") {
		var id = body;
	} else {
		var id = this.getBodyData(body, "id");	
	}
	return id;
}

//  Get a body's size
GamePhysics.prototype.getBodySize = function(body) {
	if (typeof body == "number") {
		body = this.bodies[body];	
	}
	var data = this.getBodyData(body);
	if (data) {
		return {
			width:	this.getBodyData(body, "width"),
			height:	this.getBodyData(body, "height")
		}
	} else {
		return false;	
	}
}

//  Set a body's size
GamePhysics.prototype.setBodySize = function(body, width, height) {
	var data = this.getBodyData(body);
	if (data) {
		var previousWidth = data.width;
		var previousHeight = data.height;
		var id = data.id;
		var type = body.GetType();
		var fixture = body.GetFixtureList();
		var density = fixture.GetDensity();
		var friction = fixture.GetFriction();
		var filterData = fixture.GetFilterData();
		var restitution = fixture.GetRestitution();
		var group = filterData.groupIndex;
		var rotate = !body.IsFixedRotation();
		var pos = this.getBodyPosition(body);
		this.removeBody(body);
		this.addBody({
			id:				id,
			type:			type,
			density:		density,
			friction:		friction,
			restitution:	restitution,
			x:				pos.x * this.options.world.scale,
			y:				pos.y * this.options.world.scale,
			width:			width,
			height:			height,
			rotate:			rotate,
			group:			group
		});
		this.setBodyData(id, data);
	}
}

//  Get a body's position
GamePhysics.prototype.getBodyPosition = function(body) {
	if (typeof body == "number") {
		body = this.bodies[body];
	}
	return body.GetPosition();
}

//  Set a body's position
GamePhysics.prototype.setBodyPosition = function(body, x, y) {
	if (typeof body == "number") {
		body = this.bodies[body];
	}
	if ((x === false) || (y === false)) {
		var pos = this.getBodyPosition(body);
	}
	if (x === false) {
		x =	pos.x;
	} else {
		x = utils.math.translatePercentage(x, this.canvasWidth) / this.options.world.scale;
	}
	if (y === false) {
		y = pos.y;	
	} else {
		y = utils.math.translatePercentage(y, this.canvasHeight) / this.options.world.scale;
	}
	body.SetPosition(new b2Vec2(x, y));
}

//  Kill body
GamePhysics.prototype.killBody = function(body, removeDelay) {
	if (removeDelay == undefined) {
		removeDelay = 1;	
	}
	if (this.getBodyData(body, "health") > 0) {
		this.setBodyData(body, "health", 0);
	}
	this.setBodyState(body, "dead");
	setTimeout(function() {
		this.setBodyState(body, "removed");
		this.removeBody(body);
	}.bind(this), removeDelay);	
}

//  Get body at specified coordinates
GamePhysics.prototype.getBodyAtCoordinates = function(x, y) {
	this.input.pVec = new b2Vec2(x, y);
	var aabb = new b2AABB();
	aabb.lowerBound.Set(x - 0.001, y - 0.001);
	aabb.upperBound.Set(x + 0.001, y + 0.001);
	this.selectedBody = null;
	this.world.QueryAABB(this.getCollisionBody.bind(this), aabb);
	return this.selectedBody;
}
	
//  Get collision body
GamePhysics.prototype.getCollisionBody = function(fixture) {
	var body = fixture.GetBody();
	if (body.GetType() == b2Body.b2_dynamicBody) {
		if (fixture.GetShape().TestPoint(body.GetTransform(), this.input.pVec)) {
			this.selectedBody = body;
			return false;
		}
	}
	return true;
}

//  Handle mousedown / touch
GamePhysics.prototype.update = function(x, y) {
	
	//  Remove bodies scheduled for removal
	for (var i = 0, numBodies = this.bodiesToRemove.length; i < numBodies; ++i) {
		this.world.DestroyBody(this.bodiesToRemove[i]);
	}
	this.bodiesToRemove = [];
	
	//  Loop through actions
	for (var i = 0, numActions = this.options.world.loopActions.length; i < numActions; ++i) {
		
		var action = this.options.world.loopActions[i];
		switch(action.type) {
			
			//  Handle input
			case "input":
				
				switch(action.action) {
				
					//  Drag the body at passed coordinates
					case "drag":
						if (this.input.active && (!this.input.joint)) {
							var body = this.getBodyAtCoordinates(x, y);
							if (body) {
								if (!action.ignoreStates || (action.ignoreStates.indexOf(this.getBodyState(body)) === -1)) {
									var md = new b2MouseJointDef();
									md.dampingRatio = 1;
									//md.frequencyHz = 15;
									md.bodyA = this.world.GetGroundBody();
									md.bodyB = body;
									md.target.Set(x, y);
									md.collideConnected = true;
									md.maxForce = this.options.world.maxForce * body.GetMass();
									this.input.joint = this.world.CreateJoint(md);
									body.SetAwake(true);
									this.setBodyState(body, action.dragState);
									this.dragBody = body;
								}
							}
						}
						if (this.input.joint) {
							if (this.input.active) {
								this.input.joint.SetTarget(new b2Vec2(x, y));
							} else {
								this.world.DestroyJoint(this.input.joint);
								this.input.joint = null;
								this.setBodyData(this.dragBody, {state: action.dropState});
							}
						}
						break;
				
				}
				break;
				
			//  Move bodies
			case "move":
				var bodies = this.getBodiesByProperty("state", action.state);
				for (var n = 0, numBodies = bodies.length; n < numBodies; ++n) {
					bodies[n].SetAwake(true);
					/*
					var stepX = action.stepX;
					var stepY = action.stepY;
					if ((stepX == "custom") || (stepY == "custom")) {
						var data = this.getBodyData(bodies[n]);
						if (stepX == "custom") {
							stepX = data.stepX;
						}
						if (stepY == "custom") {
							stepY = data.stepY;
						}
					}
					bodies[n].SetLinearVelocity(new b2Vec2(stepX, stepY));
					*/
					var stepX = (action.stepX * this.canvasWidth) / 1000;
					var stepY = (action.stepY * this.canvasHeight) / 1000;
					
					bodies[n].SetLinearVelocity(new b2Vec2(stepX, stepY));
				}
				break;
			
		}
		
	}
	
	//  Step the animation
	this.world.Step(this.options.world.refresh, 10, 10);
	this.world.DrawDebugData();
	this.world.ClearForces();
	
}

//  Set input state
GamePhysics.prototype.setInputState = function(active) {
	this.input.active = active;
}

//  Remove the joint
GamePhysics.prototype.removeJoint = function(joint) {
	if (!joint) {
		joint = this.input.joint;	
	}
	this.world.DestroyJoint(joint);	
}

//  Set the canvas size
GamePhysics.prototype.setCanvasSize = function(width, height) {
	this.canvasWidth = width;
	this.canvasHeight = height;
	this.bottomHalfThreshold = utils.math.translatePercentage("50%", this.canvasHeight) / this.options.world.scale;
	this.rightHalfThreshold = utils.math.translatePercentage("50%", this.canvasWidth) / this.options.world.scale;
}

//  Binder
GamePhysics.prototype.bind = function(context) {
	var fun = this;
	return function(){
		return fun.apply(context, arguments);
	};
};