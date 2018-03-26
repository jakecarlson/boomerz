// Utilities
var utils = {
	
	// CSS-related utilities
	css: {
		
		//  Changes a string to a class by prepending a "."
		strToClass: function(str, tag) {
			if (typeOf(str) == "array") {
				return utils.array.toList(str, utils.css.strToClass, tag);
			} else {
				return utils.str.prepend("." + str, tag);
			}
		},
		
		//  Changes a string to an id by prepending a "."
		strToId: function(str, tag) {
			if (typeOf(str) == "array") {
				return utils.array.toList(str, utils.css.strToId, tag);
			} else {
				return utils.str.prepend("#" + str, tag);
			}
		},
		
		//  Changes a property string and value to CSS selector
		strToAttr: function(str, property, tag) {
			if (typeOf(str) == "array") {
				return utils.array.toList(str, utils.css.strToAttr, property, tag);
			} else {
				return utils.str.prepend("[" + property + "=" + str + "]", tag);
			}
		},
		
		//  Changes a data attribute to CSS selector
		strToDataAttr: function(str, property, tag) {
			return utils.css.strToAttr(str, "data-" + property, tag);	
		}
		
	},
	
	markup: {
		
	},
	
	//  Form Related functions
	forms:	{
		
	},
	
	//  Net related function
	net:	{
		
	},
	
	//  String functions
	str:	{
		
		//  Prepend string
		prepend: function(str, prependStr) {
			if (!prependStr) {
				prependStr = "";	
			}
			return prependStr + str;
		},
		
		//  String to boolean
		toBoolean: function(str) {
			if (str) {
				return (str.toLowerCase() === "true");
			} else {
				return false;	
			}
		},
		
		//  Pluralize
		pluralize: function(str, num) {
			var returnStr = "";
			if (num !== null) {
				returnStr += num + " ";
			}
			returnStr += str;
			if ((num === null) || (num !== 1)) {
				returnStr += "s";
			}
			return returnStr;
		},
		
		capitalize: function(str) {
    		return str.charAt(0).toUpperCase() + str.slice(1);
		}
		
	},
	
	//  Array functions
	array:	{
		
		// Array to list
		toList: function(arr, func, arg1, arg2) {
			if (typeOf(arr) == "array") {
				var lst = "";
				if (func) {
					arr = arr.map(function(item, index) {
						if (func) {
							return func(item, arg1, arg2);
						} else {
							return item;
						}
					});
				}
				for (var i = 0, numItems = arr.length; i < numItems; ++i) {
					lst += arr[i] + ", ";
				}
				return lst.substr(0, lst.length-2);
			} else {
				if (func) {
					return func(arr, arg1, arg2);	
				} else {
					return arr;
				}
			}
		},
		
		//  Remove array element
		removeElement: function(arr, index) {
			return arr.splice(index, 1);	
		}
		
	},
	
	//  Math functions
	math:	{
	
		//  Translate a percentage
		translatePercentage: function(percentStr, maxNum, round) {
			if ((typeof percentStr == "string") && (percentStr.substr(percentStr.length-1) == "%")) {
				var percentage = parseFloat(percentStr.substr(0, percentStr.length-1));
				var unrounded = ((percentage / 100) * maxNum);
			} else {
				var unrounded = parseFloat(percentStr);
			}
			if (round) {
				return Math.round(unrounded);	
			} else {
				return unrounded;
			}
		}
		
	},
	
	//  Audio functions
	audio:	{
		
		//  Get the audio extension based on browser name
		getSupportedExt: function() {
			var ext = "m4a";
			if ((new Audio()).canPlayType("audio/ogg; codecs=vorbis")) {
				ext = "ogg";
			}
			return ext;
		},
		
		//  Append the supported extension to the filename
		appendSupportedExt: function(path) {
			return utils.file.changeExt(path, utils.audio.getSupportedExt());	
		}
	
	},
	
	//  Filesystem functions
	file:	{
		
		//  Change the file extension
		changeExt: function(path, ext) {
			return path.substr(0, path.lastIndexOf(".")) + "." + ext;
		}
		
	}
	
};