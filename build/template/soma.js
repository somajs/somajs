/*
 Copyright (c) | 2012 | infuse.js | Romuald Quantin | www.soundstep.com | romu@soundstep.com

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 and associated documentation files (the "Software"), to deal in the Software without restriction,
 including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial
 portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(function(infuse, undefined) {
	"use strict";

	infuse.version = "0.6.0";

	// regex from angular JS (https://github.com/angular/angular.js)
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

	if(!Array.prototype.contains) {
		Array.prototype.contains = function(value) {
			var i = this.length;
			while (i--) {
				if (this[i] === value) return true;
			}
			return false;
		};
	}

	infuse.InjectorError = {
		MAPPING_BAD_PROP: "[Error infuse.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected",
		MAPPING_BAD_VALUE: "[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, it can't null or undefined, with property: ",
		MAPPING_BAD_CLASS: "[Error infuse.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ",
		MAPPING_BAD_SINGLETON: "[Error infuse.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ",
		MAPPING_ALREADY_EXISTS: "[Error infuse.Injector.mapClass/mapValue] this mapping already exists, with property: ",
		CREATE_INSTANCE_INVALID_PARAM: "[Error infuse.Injector.createInstance] invalid parameter, a function is expected",
		NO_MAPPING_FOUND: "[Error infuse.Injector.getInstance] no mapping found",
		INJECT_INSTANCE_IN_ITSELF_PROPERTY: "[Error infuse.Injector.getInjectedValue] A matching property has been found in the target, you can't inject an instance in itself",
		INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR: "[Error infuse.Injector.getInjectedValue] A matching constructor parameter has been found in the target, you can't inject an instance in itself"
	};

	var MappingVO = function(prop, value, cl, singleton) {
		this.prop = prop;
		this.value = value;
		this.cl = cl;
		this.singleton = singleton || false;
	};

	var validateProp = function(prop) {
		if (typeof prop !== "string") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_PROP);
		}
	};

	var validateValue = function(prop, val) {
		if (!val) {
			throw new Error(infuse.InjectorError.MAPPING_BAD_VALUE + prop);
		}
	};

	var validateClass = function(prop, val) {
		if (typeof val !== "function") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_CLASS + prop);
		}
	};

	var validateBooleanSingleton = function(prop, singleton) {
		if (typeof singleton !== "boolean") {
			throw new Error(infuse.InjectorError.MAPPING_BAD_SINGLETON + prop);
		}
	};

	var validateConstructorInjectionLoop = function(name, cl) {
		var params = infuse.getConstructorParams(cl);
		if (params.contains(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
		}
	};

	var validatePropertyInjectionLoop = function(name, target) {
		if (target.hasOwnProperty(name)) {
			throw new Error(infuse.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
		}
	};

	var instantiateIgnoringConstructor = function() {
		if (typeof arguments[0] !== "function") {
			throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
		}
		var TargetClass = arguments[0];
		var args = [null];
		for (var i=1; i<arguments.length; i++) {
			args.push(arguments[i]);
		}
		return new (Function.prototype.bind.apply(TargetClass, args));
	};

	infuse.Injector = function() {
		this.mappings = {};
		this.parent = null;
	};

	infuse.getConstructorParams = function(cl) {
		var args = [];
		var clStr = cl.toString().replace(STRIP_COMMENTS, '');
		var argsFlat = clStr.match(FN_ARGS);
		var spl = argsFlat[1].split(FN_ARG_SPLIT);
		for (var i=0; i<spl.length; i++) {
			var arg = spl[i];
			arg.replace(FN_ARG, function(all, underscore, name){
				args.push(name);
			});
		}
		return args;
	};

	infuse.Injector.prototype = {

		createChild: function() {
			var injector = new infuse.Injector();
			injector.parent = this;
			return injector;
		},

		getMappingVo: function(prop) {
			if (!this.mappings) return null;
			if (this.mappings[prop]) return this.mappings[prop];
			if (this.parent) return this.parent.getMappingVo(prop);
			return null;
		},

		mapValue: function(prop, val) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateValue(prop, val);
			this.mappings[prop] = new MappingVO(prop, val);
			return this;
		},

		mapClass: function(prop, cl, singleton) {
			if (this.mappings[prop]) {
				throw new Error(infuse.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateClass(prop, cl);
			if (singleton) validateBooleanSingleton(prop, singleton);
			this.mappings[prop] = new MappingVO(prop, null, cl, singleton);
			return this;
		},

		removeMapping: function(prop) {
			this.mappings[prop] = null;
			delete this.mappings[prop];
			return this;
		},

		hasMapping: function(prop) {
			return !!this.mappings[prop];
		},

		hasInheritedMapping: function(prop) {
			return !!this.getMappingVo(prop);
		},

		getMapping: function(value) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.value === value || vo.cl === value) {
					return vo.prop;
				}
			}
		},

		getValue: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) {
				if (this.parent) return this.parent.getValue.apply(this.parent, arguments);
				else throw new Error(infuse.InjectorError.NO_MAPPING_FOUND);
			}
			if (vo.cl) {
				arguments[0] = vo.cl;
				return this.getValueFromClass.apply(this, arguments);
			}
			if (vo.value) return vo.value;
			return undefined;
		},

		getClass: function(prop) {
			var vo = this.mappings[prop];
			if (!vo) {
				if (this.parent) return this.parent.getClass(prop);
				else return undefined;
			}
			if (vo.cl) return vo.cl;
			return undefined;
		},

		instantiate: function(TargetClass) {
			if (typeof TargetClass !== "function") {
				throw new Error(infuse.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
			}
			var TargetClass = arguments[0];
			var args = [null];
			var params = infuse.getConstructorParams(TargetClass, this.mappings);
			for (var i=0; i<params.length; i++) {
				if (arguments[i+1]) {
					// argument found
					args.push(arguments[i+1]);
				}
				else {
					var name = params[i];
					// no argument found
					var vo = this.getMappingVo(name);
					if (!!vo) {
						// found mapping
						var val = this.getInjectedValue(vo, name);
						args.push(val);
					}
					else {
						// no mapping found
						args.push(undefined);
					}
				}
			}
			return new (Function.prototype.bind.apply(TargetClass, args));
		},

		inject: function (target, isParent) {
			if (this.parent) {
				this.parent.inject(target, true);
			}
			for (var name in this.mappings) {
				var vo = this.getMappingVo(name);
				if (target.hasOwnProperty(vo.prop)) {
					var val = this.getInjectedValue(vo, name);
					target[name] = val;
				}
			}
			if (typeof target.postConstruct === 'function' && !isParent) {
				target.postConstruct();
			}
			return this;
		},

		getInjectedValue: function(vo, name) {
			var val = vo.value;
			var injectee;
			if (vo.cl) {
				var params = infuse.getConstructorParams(vo.cl);
				if (vo.singleton) {
					if (!vo.value) {
						validateConstructorInjectionLoop(name, vo.cl);
						vo.value = this.instantiate(vo.cl);
						injectee = vo.value;
					}
					val = vo.value;
				}
				else {
					validateConstructorInjectionLoop(name, vo.cl);
					val = this.instantiate(vo.cl);
					injectee = val;
				}
			}
			if (injectee) {
				validatePropertyInjectionLoop(name, injectee);
				this.inject(injectee);
			}
			return val;
		},

		createInstance: function() {
			var instance = this.instantiate.apply(this, arguments);
			this.inject(instance);
			return instance;
		},

		getValueFromClass: function(cl) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.cl == cl) {
					if (vo.singleton) {
						if (!vo.value) vo.value = this.createInstance.apply(this, arguments);
						return vo.value;
					}
					else {
						return this.createInstance.apply(this, arguments);
					}
				}
			}
			if (this.parent) {
				return this.parent.getValueFromClass.apply(this.parent, arguments);
			} else {
				throw new Error(infuse.InjectorError.NO_MAPPING_FOUND);
			}
		},

		dispose: function() {
			this.mappings = {};
		}

	};

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target != "function") {
				throw new Error("Error, you must bind a function.");
			}
			var args = Array.prototype.slice.call(arguments, 1); // for normal call
			var bound = function () {
				if (this instanceof bound) {
					var F = function(){};
					F.prototype = target.prototype;
					var self = new F;
					var result = target.apply(
						self,
						args.concat(Array.prototype.slice.call(arguments))
					);
					if (Object(result) === result) {
						return result;
					}
					return self;
				} else {
					return target.apply(
						that,
						args.concat(Array.prototype.slice.call(arguments))
					);
				}
			};
			return bound;
		};
	}

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("infuse", infuse);
	}

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = infuse;
		}
		exports = infuse;
	}

})(this['infuse'] = this['infuse'] || {});


/*
 Copyright (c) | 2012 | soma-events | Romuald Quantin | www.soundstep.com

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(function (soma, undefined) {
	"use strict";

	soma.events = {};
	soma.events.version = "0.5.2";

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target != "function") {
				throw new Error("Error, you must bind a function.");
			}
			var args = Array.prototype.slice.call(arguments, 1); // for normal call
			var bound = function () {
				if (this instanceof bound) {
					var F = function(){};
					F.prototype = target.prototype;
					var self = new F;
					var result = target.apply(
						self,
						args.concat(Array.prototype.slice.call(arguments))
					);
					if (Object(result) === result) {
						return result;
					}
					return self;
				} else {
					return target.apply(
						that,
						args.concat(Array.prototype.slice.call(arguments))
					);
				}
			};
			return bound;
		};
	};

	soma.Event = function (type, params, bubbles, cancelable) {
		var e = soma.Event.createGenericEvent(type, bubbles, cancelable);
		if (params !== null && params !== undefined) {
			e.params = params;
		}
		e.isCloned = false;
		e.clone = this.clone.bind(e);
		e.isIE9 = this.isIE9;
		e.isDefaultPrevented = this.isDefaultPrevented;
		if (this.isIE9() || !e.preventDefault || (e.getDefaultPrevented === undefined && e.defaultPrevented === undefined )) {
			e.preventDefault = this.preventDefault.bind(e);
		}
		if (this.isIE9()) e.IE9PreventDefault = false;
		return e;
	};

	soma.Event.prototype.clone = function () {
		var e = soma.Event.createGenericEvent(this.type, this.bubbles, this.cancelable);
		e.params = this.params;
		e.isCloned = true;
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		e.isIE9 = this.isIE9;
		if (this.isIE9()) e.IE9PreventDefault = this.IE9PreventDefault;
		return e;
	};

	soma.Event.prototype.preventDefault = function () {
		if (!this.cancelable) return false;
		this.defaultPrevented = true;
		if (this.isIE9()) this.IE9PreventDefault = true;
		return this;
	};

	soma.Event.prototype.isDefaultPrevented = function () {
		if (!this.cancelable) return false;
		if (this.isIE9()) {
			return this.IE9PreventDefault;
		}
		if (this.defaultPrevented !== undefined) {
			return this.defaultPrevented;
		} else if (this.getDefaultPrevented !== undefined) {
			return this.getDefaultPrevented();
		}
		return false;
	};

	soma.Event.createGenericEvent = function (type, bubbles, cancelable) {
		var event;
		bubbles = bubbles !== undefined ? bubbles : true;
		if (typeof document === "object" && document.createEvent) {
			event = document.createEvent("Event");
			event.initEvent(type, !!bubbles, !!cancelable);
		} else if (typeof document === "object" && document.createEventObject) {
			event = document.createEventObject();
			event.type = type;
			event.bubbles = !!bubbles;
			event.cancelable = !!cancelable;
		} else {
			event = new EventObject(type, !!bubbles, !!cancelable);
		}
		return event;
	};

	soma.Event.prototype.isIE9 = function() {
		if (typeof document !== "object") return false;
		return document.body.style.scrollbar3dLightColor !== undefined && document.body.style.opacity !== undefined;
	};

	soma.Event.prototype.toString = function() {
		return "[soma.Event]";
	};

	var EventObject = function(type, bubbles, cancelable) {
		this.type = type;
		this.bubbles = !!bubbles;
		this.cancelable = !!cancelable;
		this.defaultPrevented = false;
		this.currentTarget = null;
		this.target = null;
	};

	soma.EventDispatcher = function () {
		this.listeners = [];
	};

	soma.EventDispatcher.prototype.addEventListener = function(type, listener, priority) {
		if (!this.listeners || !type || !listener) return;
		if (isNaN(priority)) priority = 0;
		for (var i=0; i<this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				return;
			}
		}
		this.listeners.push({type: type, listener: listener, priority: priority, scope:this});
	};

	soma.EventDispatcher.prototype.removeEventListener = function(type, listener) {
		if (!this.listeners || !type || !listener) return;
		var i = this.listeners.length;
		while(i-- > 0) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				this.listeners.splice(i, 1);
			}
		}
	};

	soma.EventDispatcher.prototype.hasEventListener = function(type) {
		if (!this.listeners || !type) return false;
		var i = 0;
		var l = this.listeners.length;
		for (; i < l; ++i) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type) {
				return true;
			}
		}
		return false;
	};

	soma.EventDispatcher.prototype.dispatchEvent = function(event) {
		if (!this.listeners || !event) throw new Error("Error in EventDispatcher (dispatchEvent), one of the parameters is null or undefined.");
		var events = [];
		var i;
		for (i = 0; i < this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === event.type) {
				events.push(eventObj);
			}
		}
		events.sort(function(a, b) {
			return b.priority - a.priority;
		});
		for (i = 0; i < events.length; i++) {
			events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
		}
		return !event.isDefaultPrevented();
	};

	soma.EventDispatcher.prototype.dispatch = function(type, params, bubbles, cancelable) {
		if (!this.listeners || !type || type === "") throw new Error("Error in EventDispatcher (dispatch), one of the parameters is null or undefined.");
		var event = new soma.Event(type, params, bubbles, cancelable);
		this.dispatchEvent(event);
		return event;
	};

	soma.EventDispatcher.prototype.dispose = function() {
		this.listeners = null;
	};

	soma.EventDispatcher.prototype.toString = function() {
		return "[soma.EventDispatcher]";
	};

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma-events", soma);
	};

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma;
		}
		exports = soma;
	};

})(this['soma'] = this['soma'] || {});


;(function (soma, undefined) {

	'use strict';

soma.template = soma.template || {};
soma.template.version = "0.0.5";

var errors = soma.template.errors = {
	TEMPLATE_STRING_NO_ELEMENT: "Error in soma.template, a string template requirement a second parameter: an element target - soma.template.create('string', element)",
	TEMPLATE_NO_PARAM: "Error in soma.template, a template requires at least 1 parameter - soma.template.create(element)"
};

var tokenStart = '{{';
var tokenEnd = '}}';
var helpersObject = {};
var helpersScopeObject = {};

var settings = soma.template.settings = soma.template.settings || {};

settings.autocreate = true;

var tokens = settings.tokens = {
	start: function(value) {
		if (isDefined(value) && value !== '') {
			tokenStart = escapeRegExp(value);
			setRegEX(value, true);
		}
		return tokenStart;
	},
	end: function(value) {
		if (isDefined(value) && value !== '') {
			tokenEnd = escapeRegExp(value);
			setRegEX(value, false);
		}
		return tokenEnd;
	}
};

var attributes = settings.attributes = {
	skip: "data-skip",
	repeat: "data-repeat",
	src: "data-src",
	href: "data-href",
	show: "data-show",
	hide: "data-hide",
	cloak: "data-cloak",
	checked: "data-checked",
	disabled: "data-disabled",
	multiple: "data-multiple",
	readonly: "data-readonly",
	selected: "data-selected",
	template: "data-template"
};

var vars = settings.vars = {
	index: "$index",
	key: "$key"
};

var regex = {
	sequence: null,
	token: null,
	expression: null,
	escape: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
	trim: /^[\s+]+|[\s+]+$/g,
	repeat: /(.*)\s+in\s+(.*)/,
	func: /(.*)\((.*)\)/,
	params: /,\s+|,|\s+,\s+/,
	quote: /\"|\'/g,
	content: /[^.|^\s]/gm,
	depth: /..\//g,
	string: /^(\"|\')(.*)(\"|\')$/
};

var ie = (function(){
	var undef,
		v = 3,
		div = document.createElement('div'),
		all = div.getElementsByTagName('i');
	while (
		div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]
		);
	return v > 4 ? v : undef;
}());
function isArray(value) {
	return Object.prototype.toString.apply(value) === '[object Array]';
};
function isObject(value) {
	return typeof value === 'object';
}
function isString(value) {
	return typeof value === 'string';
}
function isElement(value) {
	return value ? value.nodeType > 0 : false;
};
function isTextNode(el) {
	return el && el.nodeType && el.nodeType === 3;
}
function isFunction(value) {
	return value && typeof value === 'function';
}
function isDefined(value) {
	return value !== null && value !== undefined;
}
function isAttributeDefined(value) {
	return (value === "" || value === true || value === "true" || !isDefined(value));
}
function isExpression(value) {
	return value && isFunction(value.toString) && value.toString() === '[object Expression]';
}
function isNode(value) {
	return value && isFunction(value.toString) && value.toString() === '[object Node]';
}
function isExpFunction(value) {
	if (!isString(value)) return false;
	return !!value.match(regex.func);
}
function childNodeIsTemplate(node) {
	if (!node || !isElement(node.element)) return false;
	if (node.parent && templates.get(node.element)) return true;
	return false;
}
function escapeRegExp(str) {
	return str.replace(regex.escape, "\\$&");
}
function setRegEX(nonEscapedValue, isStartToken) {
	// sequence: \{\{.+?\}\}|[^{]+|\{(?!\{)[^{]*
	var unescapedCurrentStartToken = tokens.start().replace(/\\/g, '');
	var endSequence = "";
	var ts = isStartToken ? nonEscapedValue : unescapedCurrentStartToken;
	if (ts.length > 1) {
		endSequence = "|\\" + ts.substr(0, 1) + "(?!\\" + ts.substr(1, 1) + ")[^" + ts.substr(0, 1) + "]*";
	}
	regex.sequence = new RegExp(tokens.start() + ".+?" + tokens.end() + "|[^" + tokens.start() + "]+" + endSequence, "g");
	regex.token = new RegExp(tokens.start() + ".*?" + tokens.end(), "g");
	regex.expression = new RegExp(tokens.start() + "|" + tokens.end(), "gm");
}
function trim(value) {
	return value.replace(regex.trim, '');
}
function trimQuotes(value) {
	if (regex.string.test(value)) {
		return value.substr(1, value.length-2);
	}
	return value;
}
function trimArray(value) {
	if (value[0] === "") value.shift();
	if (value[value.length-1] === "") value.pop();
	return value;
}
function trimTokens(value) {
	return value.replace(regex.expression, '');
}
function trimScopeDepth(value) {
	return value.replace(regex.depth, '');
}
function insertBefore(referenceNode, newNode) {
	if (!referenceNode.parentNode) return;
	referenceNode.parentNode.insertBefore(newNode, referenceNode);
}
function insertAfter(referenceNode, newNode) {
	if (!referenceNode.parentNode) return;
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function removeClass(elm, className) {
	if (document.documentElement.classList) {
		removeClass = function (elm, className) {
			elm.classList.remove(className);
		}
	} else {
		removeClass = function (elm, className) {
			if (!elm || !elm.className) {
				return false;
			}
			var reg = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
			elm.className = elm.className.replace(reg, "$2");
		}
	}
	removeClass(elm, className);
}
function HashMap(){
	var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
	var data = {};
	var getKey = function(target) {
		if (!target) return;
		if (typeof target !== 'object') return target;
		var result;
		try {
			// IE 7-8 needs a try catch, seems like I can't add a property on text nodes
			result = target.hashkey ? target.hashkey : target.hashkey = uuid();
		} catch(err){};
		return result;
	}
	return {
		put: function(key, value) {
			data[getKey(key)] = value;
		},
		get: function(key) {
			return data[getKey(key)];
		},
		remove: function(key) {
			delete data[getKey(key)];
		},
		getData: function() {
			return data;
		},
		dispose: function() {
			for (var k in data) {
				data[k] = null;
				delete data[k];
			}
		}
	}
}

function getRepeaterData(repeaterValue, scope) {
	var parts = repeaterValue.match(regex.repeat);
	if (!parts) return;
	var source = parts[2];
	var exp = new Expression(source);
	return exp.getValue(scope);
}

function updateScopeWithRepeaterData(repeaterValue, scope, data) {
	var parts = repeaterValue.match(regex.repeat);
	if (!parts) return;
	var name = parts[1];
	scope[name] = data;
}
function getWatcherValue(exp, newValue) {
	var node = exp.node || exp.attribute.node;
	var watchers = node.template.watchers;
	var nodeTarget = node.element;
	if (!watchers) return newValue;
	var watcherNode = watchers.get(nodeTarget);
	if (!watcherNode && isTextNode(node.element) && node.parent) watcherNode = watchers.get(node.parent.element);
	var watcher = watcherNode ? watcherNode : watchers.get(exp.pattern);
	if (isFunction(watcher)) {
		var watcherValue = watcher(exp.value, newValue, exp.pattern, node.scope, node, exp.attribute);
		if (isDefined(watcherValue)) {
			return watcherValue;
		}
	}
	return newValue;
}

function getScopeFromPattern(scope, pattern) {
	var depth = getScopeDepth(pattern);
	var scopeTarget = scope;
	while (depth > 0) {
		scopeTarget = scopeTarget._parent ? scopeTarget._parent : scopeTarget;
		depth--;
	}
	return scopeTarget;
}

function getValueFromPattern(scope, pattern) {
	var exp = new Expression(pattern);
	return getValue(scope, exp.pattern, exp.path, exp.params, exp.isFunction);
}

function getValue(scope, pattern, pathString, params, paramsFound) {
	// string
	if (regex.string.test(pattern)) {
		return trimQuotes(pattern);
	}
	// find params
	var paramsValues = [];
	if (!paramsFound && params) {
		var j = -1, jl = params.length;
		while (++j < jl) {
			paramsValues.push(getValueFromPattern(scope, params[j]));
		}
	}
	else paramsValues = paramsFound;
	// find scope
	var scopeTarget = getScopeFromPattern(scope, pattern);
	// remove parent string
	pattern = pattern.replace(/..\//g, '');
	pathString = pathString.replace(/..\//g, '');
	if (!scopeTarget) return undefined;
	// search path
	var path = scopeTarget;
	var pathParts = pathString.split(/\.|\[|\]/g);
	if (pathParts.length > 0) {
		var i = -1, l = pathParts.length;
		while (++i < l) {
			if (pathParts[i] !== "") {
				path = path[pathParts[i]];
			}
			if (!isDefined(path)) {
				// no path, search in parent
				if (scopeTarget._parent) return getValue(scopeTarget._parent, pattern, pathString, params, paramsValues);
				else return undefined;
			}
		}
	}
	// return value
	if (!isFunction(path)) {
		return path;
	}
	else {
		return path.apply(null, paramsValues);
	}
	return undefined;
}

function getExpressionPath(value) {
	var val = value.split('(')[0];
	val = trimScopeDepth(val);
	return val;
}

function getParamsFromString(value) {
	return trimArray(value.split(regex.params));
}

function getScopeDepth(value) {
	var val = value.split('(')[0];
	var matches = val.match(regex.depth);
	return !matches ? 0 : matches.length;
}

function getNodeFromElement(element, scope, isRepeaterDescendant) {
	var node = new Node(element, scope);
	node.previousSibling = element.previousSibling;
	node.nextSibling = element.nextSibling;
	var attributes = [];
	for (var attr, name, value, attrs = element.attributes, j = 0, jj = attrs && attrs.length; j < jj; j++) {
		attr = attrs[j];
		if (attr.specified) {
			name = attr.name;
			value = attr.value;
			if (name === settings.attributes.skip) {
				node.skip = (value === "" || value === "true");
			}
			if (!isRepeaterDescendant && name === settings.attributes.repeat) {
				node.repeater = value;
			}
			if (
				hasInterpolation(name + ':' + value) ||
					name === settings.attributes.repeat ||
					name === settings.attributes.show ||
					name === settings.attributes.hide ||
					name === settings.attributes.href ||
					name === settings.attributes.checked ||
					name === settings.attributes.disabled ||
					name === settings.attributes.multiple ||
					name === settings.attributes.readonly ||
					name === settings.attributes.selected ||
					value.indexOf(settings.attributes.cloak) !== -1
				) {
				attributes.push(new Attribute(name, value, node));
			}
		}
	}
	node.attributes = attributes;
	return node;
}

function hasInterpolation(value) {
	var matches = value.match(regex.token);
	return matches && matches.length > 0;
}

function hasContent(value) {
	return regex.content.test(value)
}

function isElementValid(element) {
	if (!element) return;
	var type = element.nodeType;
	if (!element || !type) return false;
	// comment
	if (type === 8) return false;
	// empty text node
	if (type === 3 && !hasContent(element.nodeValue) && !hasInterpolation(element.nodeValue)) return false;
	// result
	return true;
}

function compile(template, element, parent, nodeTarget) {
	if (!isElementValid(element)) return;
	// get node
	var node;
	if (!nodeTarget) {
		node = getNodeFromElement(element, parent ? parent.scope : new Scope(helpersScopeObject)._createChild());
	}
	else {
		node = nodeTarget;
		node.parent = parent;
	}
	node.template = template;
	// children
	if (node.skip) return;
	var child = element.firstChild;
	while (child) {
		var childNode = compile(template, child, node);
		if (childNode) {
			childNode.parent = node;
			node.children.push(childNode);
		}
		child = child.nextSibling;
	}
	return node;
}

function updateScopeWithData(scope, data) {
	clearScope(scope);
	for (var d in data) {
		scope[d] = data[d];
	}
}

function clearScope(scope) {
	for (var key in scope) {
		if (key.substr(0, 1) !== '_') {
			scope[key] = null;
			delete scope[key];
		}
	}
}

function updateNodeChildren(node) {
	if (childNodeIsTemplate(node) || node.repeater || !node.children) return;
	var i = -1, l = node.children.length;
	while (++i < l) {
		node.children[i].update();
	}
}

function renderNodeChildren(node) {
	if (childNodeIsTemplate(node) || !node.children) return;
	var i = -1, l = node.children.length;
	while (++i < l) {
		node.children[i].render();
	}
}

function renderNodeRepeater(node) {
	var data = getRepeaterData(node.repeater, node.scope);
	var previousElement;
	if (isArray(data)) {
		// process array
		var i = -1;
		var l1 = data.length;
		var l2 = node.childrenRepeater.length;
		var l = l1 > l2 ? l1 : l2;
		while (++i < l) {
			if (i < l1) {
				previousElement = createRepeaterChild(node, i, data[i], vars.index, i, previousElement);
			}
			else {
				node.parent.element.removeChild(node.childrenRepeater[i].element);
				node.childrenRepeater[i].dispose();
			}
		}
		if (node.childrenRepeater.length > data.length) {
			node.childrenRepeater.length = data.length;
		}
	}
	else {
		// process object
		var count = -1;
		for (var o in data) {
			count++;
			previousElement = createRepeaterChild(node, count, data[o], vars.key, o, previousElement);
		}
		var size = count;
		while (count++ < node.childrenRepeater.length-1) {
			node.parent.element.removeChild(node.childrenRepeater[count].element);
			node.childrenRepeater[count].dispose();
		}
		node.childrenRepeater.length = size+1;
	}
	if (node.element.parentNode) {
		node.element.parentNode.removeChild(node.element);
	}
}

function cloneRepeaterNode(element, node) {
	var newNode = new Node(element, node.scope._createChild());
	if (node.attributes) {
		var i = -1, l = node.attributes.length;
		var attrs = [];
		while (++i < l) {
			if (node.attributes[i].name === settings.attributes.skip) {
				newNode.skip = (node.attributes[i].value === "" || node.attributes[i].value === "true");
			}
			if (node.attributes[i].name !== attributes.repeat) {
				var attribute = new Attribute(node.attributes[i].name, node.attributes[i].value, newNode);
				attrs.push(attribute);
			}
		}
		newNode.isRepeaterDescendant = true;
		newNode.attributes = attrs;
	}
	return newNode;
}

function createRepeaterChild(node, count, data, indexVar, indexVarValue, previousElement) {
	var existingChild = node.childrenRepeater[count];
	if (!existingChild) {
		// no existing node
		var newElement = node.element.cloneNode(true);
		// can't recreate the node with a cloned element on IE7
		// be cause the attributes are not specified annymore (attribute.specified)
		//var newNode = getNodeFromElement(newElement, node.scope._createChild(), true);
		var newNode = cloneRepeaterNode(newElement, node)
		newNode.parent = node.parent;
		newNode.template = node.template;
		node.childrenRepeater[count] = newNode;
		updateScopeWithRepeaterData(node.repeater, newNode.scope, data);
		newNode.scope[indexVar] = indexVarValue;
		compile(node.template, newElement, node.parent, newNode);
		newNode.update();
		newNode.render();
		if (!previousElement) {
			if (node.previousSibling) insertAfter(node.previousSibling, newElement);
			else if (node.nextSibling) insertBefore(node.nextSibling, newElement);
			else node.parent.element.appendChild(newElement);
		}
		else {
			insertAfter(previousElement, newElement);
		}
		return newElement;
	}
	else {
		// existing node
		updateScopeWithRepeaterData(node.repeater, existingChild.scope, data);
		existingChild.scope[indexVar] = indexVarValue;
		existingChild.update();
		existingChild.render();
		return existingChild.element;
	}
}

var Scope = function(data) {
	function createChild(data) {
		var obj = createObject(data);
		obj._parent = this;
		this._children.push(obj);
		return obj;
	}
	function createObject(data) {
		var obj = data || {};
		obj._parent = null;
		obj._children = [];
		obj._createChild = function(data) {
			return createChild.apply(obj, arguments);
		}
		return obj;
	}
	return createObject(data);
};

var Node = function(element, scope) {
	this.element = element;
	this.scope = scope;
	this.attributes = null;
	this.value = null;
	this.interpolation = null;
	this.invalidate = false;
	this.skip = false;
	this.repeater = null;
	this.isRepeaterDescendant = false;
	this.parent = null;
	this.children = [];
	this.childrenRepeater = [];
	this.previousSibling = null;
	this.nextSibling = null;
	this.template = null;

	if (isTextNode(this.element)) {
		this.value = this.element.nodeValue;
		this.interpolation = new Interpolation(this.value, this);
	}

};
Node.prototype = {
	toString: function() {
		return '[object Node]';
	},
	dispose: function() {
		var i, l;
		if (this.children) {
			i = -1; l = this.children.length;
			while (++i < l) {
				this.children[i].dispose();
			}
		}
		if (this.childrenRepeater) {
			i = 0; l = this.childrenRepeater.length;
			while (++i < l) {
				this.childrenRepeater[i].dispose();
			}
		}
		if (this.attributes) {
			i = 0; l = this.attributes.length;
			while (++i < l) {
				this.attributes[i].dispose();
			}
		}
		if (this.interpolation) {
			this.interpolation.dispose();
		}
		this.element = null;
		this.scope = null;
		this.attributes = null;
		this.attributesHashMap = null;
		this.value = null;
		this.interpolation = null;
		this.repeater = null;
		this.parent = null;
		this.children = null;
		this.childrenRepeater = null;
		this.previousSibling = null;
		this.nextSibling = null;
		this.template = null;
	},
	getNode: function(element) {
		var node;
		if (element === this.element) return this;
		else if (this.childrenRepeater.length > 0) {
			var k = -1, kl = this.childrenRepeater.length;
			while (++k < kl) {
				node = this.childrenRepeater[k].getNode(element);

				if (node) return node;
			}
		}
		else {
			var i = -1, l = this.children.length;
			while (++i < l) {
				node = this.children[i].getNode(element);
				if (node) return node;
			}
		}
		return null;
	},
	getAttribute: function(name) {
		if (this.attributes) {
			var i = -1, l = this.attributes.length;
			while (++i < l) {
				var att = this.attributes[i];
				if (att.interpolationName && att.interpolationName.value === name) {
					return att;
				}
			}
		}
	},
	update: function() {
		if (childNodeIsTemplate(this)) return;
		if (isDefined(this.interpolation)) {
			this.interpolation.update();
		}
		if (isDefined(this.attributes)) {
			var i = -1, l = this.attributes.length;
			while (++i < l) {
				this.attributes[i].update();
			}
		}
		updateNodeChildren(this);
	},
	invalidateData: function() {
		if (childNodeIsTemplate(this)) return;
		this.invalidate = true;
		var i, l;
		if (this.attributes) {
			i = -1
			l = this.attributes.length;
			while (++i < l) {
				this.attributes[i].invalidate = true;
			}
		}
		i = -1;
		l = this.childrenRepeater.length;
		while (++i < l) {
			this.childrenRepeater[i].invalidateData();
		}
		i = -1;
		l = this.children.length;
		while (++i < l) {
			this.children[i].invalidateData();
		}
	},
	render: function() {
		if (childNodeIsTemplate(this)) return;
		if (this.invalidate) {
			this.invalidate = false;
			if (isTextNode(this.element)) {
				this.value = this.element.nodeValue = this.interpolation.render();
			}
		}
		if (this.attributes) {
			var i = -1, l = this.attributes.length;
			while (++i < l) {
				this.attributes[i].render();
			}
		}
		if (this.repeater) {
			renderNodeRepeater(this);
		}
		else {
			renderNodeChildren(this);
		}
	}
};
var Attribute = function(name, value, node) {
	this.name = name;
	this.value = value;
	this.node = node;
	this.interpolationName = new Interpolation(this.name, null, this);
	this.interpolationValue = new Interpolation(this.value, null, this);
	this.invalidate = false;
};
Attribute.prototype = {
	toString: function() {
		return '[object Attribute]';
	},
	dispose: function() {
		if (this.interpolationName) this.interpolationName.dispose();
		if (this.interpolationValue) this.interpolationValue.dispose();
		this.interpolationName = null;
		this.interpolationValue = null;
		this.node = null;
		this.name = null;
		this.value = null;
		this.previousName = null;
	},
	update: function() {
		this.interpolationName.update();
		this.interpolationValue.update();
	},
	render: function() {
		if (this.node.repeater) return;
		var element = this.node.element;
		if (this.invalidate) {
			this.invalidate = false;
			this.previousName = this.name;
			this.name = this.interpolationName.render() || this.name;
			this.value = this.interpolationValue.render() || this.value;
			if (this.name === attributes.src) {
				renderSrc(this.name, this.value);
			}
			else if (this.name === attributes.href) {
				renderHref(this.name, this.value);
			}
			else {
				if (this.node.isRepeaterDescendant && ie === 7) {
					// delete attributes on cloned elements crash IE7
				}
				else {
					this.node.element.removeAttribute(this.interpolationName.value);
				}
				if (this.previousName) {
					if (ie === 7 && this.previousName === 'class') {
						// iE
						this.node.element.className = "";
					}
					else {
						if (this.node.isRepeaterDescendant && ie === 7) {
							// delete attributes on cloned elements crash IE7
						}
						else {
							this.node.element.removeAttribute(this.previousName);
						}
					}
				}
				renderAttribute(this.name, this.value, this.previousName);
			}
		}
		// cloak
		if (this.name === 'class' && this.value.indexOf(settings.attributes.cloak) !== -1) {
			removeClass(this.node.element, settings.attributes.cloak);
		}
		// hide
		if (this.name === attributes.hide) {
			element.style.display = isAttributeDefined(this.value) ? "none" : "block";
		}
		// show
		if (this.name === attributes.show) {
			element.style.display = isAttributeDefined(this.value) ? "block" : "none";
		}
		// checked
		if (this.name === attributes.checked) {
			if (ie === 7) {
				// IE
				element.checked = isAttributeDefined(this.value) ? true : false;
			}
			else {
				renderSpecialAttribute(this.name, this.value, 'checked');
			}
		}
		// disabled
		if (this.name === attributes.disabled) {
			renderSpecialAttribute(this.name, this.value, 'disabled');
		}
		// multiple
		if (this.name === attributes.multiple) {
			renderSpecialAttribute(this.name, this.value, 'multiple');
		}
		// readonly
		if (this.name === attributes.readonly) {
			if (ie === 7) {
				element.readOnly = isAttributeDefined(this.value) ? true : false;
			}
			else {
				renderSpecialAttribute(this.name, this.value, 'readonly');
			}
		}
		// selected
		if (this.name === attributes.selected) {
			renderSpecialAttribute(this.name, this.value, 'selected');
		}
		// normal attribute
		function renderAttribute(name, value) {
			if (ie === 7 && name === "class") {
				element.className = value;
			}
			else {
				element.setAttribute(name, value);
			}
		}
		// special attribute
		function renderSpecialAttribute(name, value, attrName) {
			if (isAttributeDefined(value)) {
				element.setAttribute(attrName, attrName);
			}
			else {
				element.removeAttribute(attrName);
			}
		}
		// src attribute
		function renderSrc(name, value) {
			element.setAttribute('src', value);
		}
		// href attribute
		function renderHref(name, value) {
			element.setAttribute('href', value);
		}
	}
};

var Interpolation = function(value, node, attribute) {
	this.value = node && !isTextNode(node.element) ? trim(value) : value;
	this.node = node;
	this.attribute = attribute;
	this.sequence = [];
	this.expressions = [];
	var parts = this.value.match(regex.sequence);
	if (parts) {
		var i = -1, l = parts.length;
		while (++i < l) {
			if (parts[i].match(regex.token)) {
				var exp = new Expression(trimTokens(parts[i]), this.node, this.attribute);
				this.sequence.push(exp);
				this.expressions.push(exp);
			}
			else {
				this.sequence.push(parts[i]);
			}
		}
		trimArray(this.sequence);
	}
};
Interpolation.prototype = {
	toString: function() {
		return '[object Interpolation]';
	},
	dispose: function() {
		if (this.expressions) {
			var i = -1, l = this.expressions.length;
			while (++i < l) {
				this.expressions[i].dispose();
			}
		}
		this.value = null;
		this.node = null;
		this.attribute = null;
		this.sequence = null;
		this.expressions = null;
	},
	update: function() {
		var i = -1, l = this.expressions.length;
		while (++i < l) {
			this.expressions[i].update();
		}
	},
	render: function() {
		var rendered = "";
		if (this.sequence) {
			var i = -1, l = this.sequence.length;
			while (++i < l) {
				var val = "";
				if (isExpression(this.sequence[i])) val = this.sequence[i].value;
				else val = this.sequence[i];
				if (!isDefined(val)) val = "";
				rendered += val;
			}
		}
		return rendered;
	}
};

var Expression = function(pattern, node, attribute) {
	if (!isDefined(pattern)) return;
	this.pattern = pattern;
	this.isString = regex.string.test(pattern);
	this.node = node;
	this.attribute = attribute;
	this.value = this.isString ? this.pattern : undefined;
	if (this.isString) {
		this.isFunction = false;
		this.depth = null;
		this.path = null;
		this.params = null;
	}
	else {
		this.isFunction = isExpFunction(this.pattern);
		this.depth = getScopeDepth(this.pattern);
		this.path = getExpressionPath(this.pattern);
		this.params = !this.isFunction ? null : getParamsFromString(this.pattern.match(regex.func)[2]);
	}
};
Expression.prototype = {
	toString: function() {
		return '[object Expression]';
	},
	dispose: function() {
		this.pattern = null;
		this.node = null;
		this.attribute = null;
		this.path = null;
		this.params = null;
		this.value = null;
	},
	update: function() {
		var node = this.node;
		if (!node && this.attribute) node = this.attribute.node;
		if (!node && node.scope) return;
		var newValue = this.getValue(node.scope);
		newValue = getWatcherValue(this, newValue);
		if (this.value !== newValue) {
			this.value = newValue;
			(this.node || this.attribute).invalidate = true;
		}
	},
	getValue: function(scope) {
		return getValue(scope, this.pattern, this.path, this.params);
	}
};

var templates = new HashMap();

var Template = function(element) {
	this.watchers = new HashMap();
	this.node = null;
	this.scope = null;
	this.compile(element);
};
Template.prototype = {
	toString: function() {
		return '[object Template]';
	},
	compile: function(element) {
		if (element) this.element = element;
		if (this.node) this.node.dispose();
		this.node = compile(this, this.element);
		this.node.root = true;
		this.scope = this.node.scope;
	},
	update: function(data) {
		if (isDefined(data)) updateScopeWithData(this.node.scope, data);
		if (this.node) this.node.update();
	},
	render: function(data) {
		this.update(data);
		if (this.node) this.node.render();
	},
	invalidate: function() {
		if (this.node) this.node.invalidateData();
	},
	watch: function(target, watcher) {
		if ( (!isString(target) && !isElement(target)) || !isFunction(watcher)) return;
		this.watchers.put(target, watcher);
	},
	unwatch: function(target) {
		this.watchers.remove(target);
	},
	clearWatchers: function() {
		this.watchers.dispose();
	},
	getNode: function(element) {
		return this.node.getNode(element);
	},
	dispose: function() {
		templates.remove(this.element);
		if (this.watchers) {
			this.watchers.dispose();
		}
		if (this.node) {
			this.node.dispose();
		}
		this.element = null;
		this.watchers = null;
		this.node = null;
	}
};

if (settings.autocreate) {
	var ready = (function(ie,d){d=document;return ie?
		function(c){var n=d.firstChild,f=function(){try{c(n.doScroll('left'))}catch(e){setTimeout(f,10)}};f()}:/webkit|safari|khtml/i.test(navigator.userAgent)?
		function(c){var f=function(){/loaded|complete/.test(d.readyState)?c():setTimeout(f,10)};f()}:
		function(c){d.addEventListener("DOMContentLoaded", c, false)}
	})(/*@cc_on 1@*/);
	ready(function() {
		var child = document.body.firstChild;
		while (child) {
			if (child.nodeType === 1) {
				var attrValue = child.getAttribute(attributes.template);
				if (attrValue) {
					var getFunction = new Function('return ' + attrValue + ';');
					try {
						var f = getFunction();
						if (isFunction(f)) {
							soma.template.bootstrap(attrValue, child, f);
						}
					} catch(err){};
				}
			}
			child = child.nextSibling;
		}
	});
}
function bootstrapTemplate(attrValue, element, func) {
	var tpl = createTemplate(element);
	func(tpl, tpl.scope, tpl.element, tpl.node);
}
function createTemplate(source, target) {
	var element;
	if (isString(source)) {
		// string template
		if (!isElement(target)) {
			throw new Error(soma.template.errors.TEMPLATE_STRING_NO_ELEMENT);
		}
		target.innerHTML = source;
		element = target;
	}
	else if (isElement(source)) {
		if (isElement(target)) {
			// element template with target
			target.innerHTML = source.innerHTML;
			element = target;
		}
		else {
			// element template
			element = source;
		}
	}
	else {
		throw new Error(soma.template.errors.TEMPLATE_NO_PARAM);
	}
	// existing template
	if (getTemplate(element)) {
		getTemplate(element).dispose();
		templates.remove(element);
	}
	// create template
	var template = new Template(element);
	templates.put(element, template);
	return template;
}

function getTemplate(element) {
	if (!isElement(element)) return null;
	return templates.get(element);
}

function renderAllTemplates() {
	for (var key in templates.getData()) {
		templates.get(key).render();
	}
}

function appendHelpers(obj) {
	if (obj === null) {
		helpersObject = {};
		helpersScopeObject = {};
	}
	if (isDefined(obj) && isObject(obj)) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				helpersObject[key] = helpersScopeObject[key] = obj[key];
			}
		}
	}
	return helpersObject;
}

// set regex
tokens.start(tokenStart);
tokens.end(tokenEnd);

// exports
soma.template.create = createTemplate;
soma.template.get = getTemplate;
soma.template.renderAll = renderAllTemplates;
soma.template.helpers = appendHelpers;
soma.template.bootstrap = bootstrapTemplate;

// register for AMD module
if (typeof define === 'function' && define.amd) {
	define("soma-template", soma.template);
}

// export for node.js
if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = soma.template;
	}
	exports = soma.template;
}

})(this['soma'] = this['soma'] || {});
;(function(soma, undefined) {

	soma.template = soma.template || {};

    var SomaTemplatePlugin = function(instance, injector) {
	    var proto = instance.constructor.prototype;
	    proto.createTemplate = function(cl, domElement) {
		    if (!cl || typeof cl !== "function") {
			    throw new Error("Error creating a template, the first parameter must be a function.");
		    }
		    if (domElement && isElement(domElement)) {
			    var template = soma.template.create(domElement);
			    for (var key in template) {
				    if (typeof template[key] === 'function') {
				        cl.prototype[key] = template[key].bind(template);
				    }
			    }
			    cl.prototype.render = template.render.bind(template);
			    var childInjector = this.injector.createChild();
			    childInjector.mapValue("template", template);
			    childInjector.mapValue("scope", template.scope);
			    childInjector.mapValue("element", template.element);
			    return childInjector.createInstance(cl);
		    }
		    return null;
	    }

		soma.template.bootstrap = function(attrValue, element, func) {
			instance.createTemplate(func, element);
		}

    };

	function isElement(value) {
		return value ? value.nodeType > 0 : false;
	};

	// exports
	soma.template.plugin = SomaTemplatePlugin;

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma-template-plugin", soma.template);
	}

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma.template.plugin;
		}
		exports = soma.template.plugin;
	}


})(this['soma'] = this['soma'] || {});

;(function (soma, undefined) {

	soma.version = "2.0.0";

	soma.applyProperties = function(target, extension, list) {
		if (typeof list === 'object' && list instanceof Array && list.length > 0) {
			var length = list.length;
			for (var i = 0; i < length; i++) {
				if (!target[list[i]]) {
					target[list[i]] = extension[list[i]].bind(extension);
				}
			}
		}
		else {
			for (var prop in extension) {
				target[prop] = extension[prop];
			}
		}
	};

	soma.augment = function (target, extension, list) {
		if (!target.prototype || !extension.prototype) return;
		if (typeof list === 'object' && list instanceof Array && list.length > 0) {
			var length = list.length;
			for (var i = 0; i < length; i++) {
				if (!target.prototype[list[i]] || override) {
					target.prototype[list[i]] = extension.prototype[list[i]];
				}
			}
		}
		else {
			for (var prop in extension.prototype) {
				if (!target.prototype[list[i]] || override) {
					target.prototype[list[i] = extension.prototype[list[i]]];
				}
			}
		}
	};

	soma.inherit = function (target, obj) {
		var subclass;
		if (obj && obj.hasOwnProperty('constructor')) {
			// use constructor if defined
			subclass = obj.constructor;
		} else {
			// call the super constructor
			subclass = function () {
				return target.apply(this, arguments);
			};
		}
		// add super properties
		soma.applyProperties(subclass.prototype, target.prototype);
		// set the prototype chain to inherit from the parent without calling parent's constructor
		var chain = function () {
		};
		chain.prototype = target.prototype;
		subclass.prototype = new chain();
		// add obj properties
		if (obj) soma.applyProperties(subclass.prototype, obj, target.prototype);
		// point constructor to the subclass
		subclass.prototype.constructor = subclass;
		// set super class reference
		subclass.parent = target.prototype;
		// add extend shortcut
		subclass.extend = function (obj) {
			return soma.inherit(subclass, obj);
		};
		return subclass;
	};

	soma.extend = function (obj) {
		return soma.inherit(function () {
		}, obj);
	};
	soma.Application = soma.extend({
		constructor: function() {
			setup.bind(this)();
			this.init();
			this.start();

			function setup() {
				// injector
				this.injector = new infuse.Injector(this.dispatcher);
				// dispatcher
				this.dispatcher = new soma.EventDispatcher();
				soma.applyProperties(this, this.dispatcher, ['dispatchEvent', 'addEventListener', 'removeEventListener', 'hasEventListener']);
				// mapping
				this.injector.mapValue('injector', this.injector);
				this.injector.mapValue('instance', this);
				this.injector.mapValue('dispatcher', this.dispatcher);
				// mediator
				this.injector.mapClass('mediators', Mediators, true);
				this.mediators = this.injector.getValue('mediators');
				// commands
				this.injector.mapClass('commands', Commands, true);
				this.commands = this.injector.getValue('commands');
			}

		},
		createPlugin: function() {
			if (arguments.length == 0 || !arguments[0]) {
				throw new Error("Error creating a plugin, plugin class is missing.");
			}
			var params = infuse.getConstructorParams(arguments[0]);
			var args = [arguments[0]];
			for (var i=0; i<params.length; i++) {
				if (this.injector.hasMapping(params[i]) || this.injector.hasInheritedMapping(params[i])) {
					args.push(this.injector.getValue(params[i]));
				}
			}
			for (var i=1; i<arguments.length; i++) {
				args.push(arguments[i]);
			}
			return this.injector.createInstance.apply(this.injector, args);
		},
		init: function() {

		},
		start: function() {

		}
	});

	var Mediators = soma.extend({
		constructor: function() {
			this.injector = null;
		},
		create: function(cl, list) {
			if (!cl || typeof cl !== "function") {
				throw new Error("Error creating a mediator, the first parameter must be a function.");
			}
			if (typeof list === 'object' && list.length > 0) {
				var arr = [];
				var length = list.length;
				for (var i=0; i<length; i++) {
					var injector = this.injector.createChild();
					injector.mapValue("injector", injector);
					injector.mapValue("target", list[i]);
					var mediator = injector.createInstance(cl);
					arr.push(mediator);
				}
				return arr;
			}
		}
	});

	var Commands = soma.extend({
		constructor: function() {
			this.boundHandler = this.handler.bind(this);
			this.dispatcher = null;
			this.injector = null;
			this.list = {};
		},
		has: function(commandName) {
			return this.list[ commandName ] != null;
		},
		get: function(commandName) {
			if (this.hasCommand(commandName)) {
				return this.list[commandName];
			}
			return null;
		},
		getAll: function() {
			var a = [];
			var cmds = this.list;
			for (var c in cmds) {
				a.push(c);
			}
			return a;
		},
		add: function(commandName, command) {
			if (this.has(commandName)) {
				throw new Error("Error in " + this + " Command \"" + commandName + "\" already registered.");
			}
			if (this.has(typeof command !== 'function')) {
				throw new Error("Error in " + this + " Command \"" + command + "\" must be a function, and contain an execute public method.");
			}
			this.list[ commandName ] = command;
			this.addInterceptor(commandName);
		},
		remove: function(commandName) {
			if (!this.hasCommand(commandName)) {
				return;
			}
			this.list[commandName] = null;
			delete this.list[commandName];
			this.removeInterceptor(commandName);
		},
		addInterceptor: function(commandName) {
			this.dispatcher.addEventListener(commandName, this.boundHandler, -Number.MAX_VALUE);
		},
		removeInterceptor: function(commandName) {
			this.dispatcher.removeEventListener(commandName, this.boundHandler);
		},
		handler: function(event) {
			if (!event.isDefaultPrevented()) {
				this.executeCommand(event);
			}
		},
		executeCommand: function(event) {
			var commandName = event.type;
			if (this.has(commandName)) {
				var command = this.injector.createInstance(this.list[commandName]);
				if (!command.hasOwnProperty('execute') && command['execute'] === 'function') {
					throw new Error("Error in " + this + " Command \"" + command + "\" must contain an execute public method.");
				}
				command.execute(event);
			}
		}
	});


	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma", soma);
	}

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma;
		}
		exports = soma;
	}

})(this['soma'] = this['soma'] || {});