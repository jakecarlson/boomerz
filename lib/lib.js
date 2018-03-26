///  Create global namespace and add include function
var lib = {
	
	//  Object properties
	includes: 		[],
	includePath:	"",
	lastTime:		new Date().getMilliseconds(),
	totalTime:		0,
	
	//  Initialize
	init: function(scripts) {
	
		//  Set the include path
		this.setIncludePath();
		
		//  Include all passed scripts
		if (scripts) {
			this.include(scripts);	
		}
			
	},
	
	//  This function is used to include other scripts
	include: function (path, includePath) {
		
		//  If the path is an array, loop through recursively
		if (typeof path == "object") {
			
			for (var i = 0, numIncludes = path.length; i < numIncludes; ++i) {
				this.include(path[i], includePath);	
			}
				
		} else {
		
			//  Prepend the include path is necessary
			if (includePath) {
				path = includePath + path;
			} else if (path.substr(0,4) != "http") {
				path = this.getIncludePath() + path;	
			}
	
			//  Only include the script if it hasn't already been included
			if (this.includes.toString().indexOf(path) == -1) {
				
				//  Write the script tag
				document.write('<script type="text/javascript" src="' + path + '"></script>');
				
				//  Append the path to the includes array
				this.includes.push(path);
				
			}
		
		}
	
	},
	
	//  Sets the include path
	setIncludePath: function() {
		var scripts = document.getElementsByTagName("script");
		var scriptPath = scripts[scripts.length-1].getAttribute("src");
		this.includePath = scriptPath.substring(0, scriptPath.lastIndexOf("/"));
	},
	
	//  Get the include path
	getIncludePath: function() {
		return this.includePath;	
	},
	
	//  Log time
	logTime: function(str) {
		var newTime = new Date().getTime();
		var timeDiff = (newTime - this.lastTime);
		this.totalTime = this.totalTime + timeDiff;
		logger.log(str + ": " + timeDiff + "ms ("+this.totalTime+"ms)");
		this.lastTime = new Date().getTime();
	}
	
};

//  Initialize the library
lib.init(
	[
		"/mootools-core-1.4.5-full-nocompat-yc.js",
		"/mootools-more-1.4.0.1.js",
		"/mootools-mobile.js",
		"/rAF.js",
		"/Box2dWeb-2.1.a.3.min.js",
		"/utils.js",
		"/LocalStorage.js",
		"/Logger.js",
		"/GameSprite.js",
		"/GameEntity.js",
		"/ExpirableGameEntity.js",
		"/GamePhysics.js",
		"/GameScreen.js",
		"/GameLevelScreen.js",
		"/GameAudio.js",
		"/Game.js"
	]
);