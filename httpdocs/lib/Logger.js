//  Logger
function Logger(options) {
	
	//  Set option defaults
	if (!options) {
		options = {};	
	}
	if (options.debug == undefined) {
		options.debug = false;
	}
	if (options.alert == undefined) {
		options.alert = false;
	}
	this.options = options;
	
	//  Set timestamp
	this.lastTime = new Date().getTime();
	
}

//  Log
Logger.prototype.log = function(str) {
	if (this.options.debug) {
		var newTime = new Date().getTime();
		var str = str + " (" + (newTime - this.lastTime) + "ms)";
		if (this.options.alert) {
			alert(str);
		} else if (console && console.log) {
			console.log(str);
		}
		this.lastTime = newTime;
	}
}

//  Binder
Logger.prototype.bind = function(context) {
	var fun = this;
	return function(){
		return fun.apply(context, arguments);
	};
};