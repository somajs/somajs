;(function (soma, undefined) {

	soma.version = "2.0.0";

	// HELPERS

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			var target = this;
			if (typeof target != "function") {
				throw new Error("Error, you must bind a function.");
			}
			var args = Array.prototype.slice.call(arguments, 1); // for normal call
			var bound = function () {
				if (this instanceof bound) {
					var F = function () {
					};
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

	if (!Array.prototype.contains) {
		Array.prototype.contains = function (value) {
			var i = this.length;
			while (i--) {
				if (this[i] === value) return true;
			}
			return false;
		};
	};

	// INHERITANCE

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

	// INJECTOR

	// regex from angular JS (https://github.com/angular/angular.js)
	var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
	var FN_ARG_SPLIT = /,/;
	var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
	var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


	soma.InjectorError = {
		MAPPING_BAD_PROP:"[Error soma.Injector.mapClass/mapValue] the first parameter is invalid, a string is expected",
		MAPPING_BAD_VALUE:"[Error soma.Injector.mapClass/mapValue] the sescond parameter is invalid, it can't null or undefined, with property: ",
		MAPPING_BAD_CLASS:"[Error soma.Injector.mapClass/mapValue] the second parameter is invalid, a function is expected, with property: ",
		MAPPING_BAD_SINGLETON:"[Error soma.Injector.mapClass] the third parameter is invalid, a boolean is expected, with property: ",
		MAPPING_ALREADY_EXISTS:"[Error soma.Injector.mapClass/mapValue] this mapping already exists, with property: ",
		CREATE_INSTANCE_INVALID_PARAM:"[Error soma.Injector.createInstance] invalid parameter, a function is expected",
		GET_INSTANCE_NO_MAPPING:"[Error soma.Injector.getInstance] no mapping found",
		INJECT_INSTANCE_IN_ITSELF_PROPERTY:"[Error soma.Injector.getInjectedValue] A matching property has been found in the target, you can't inject an instance in itself",
		INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR:"[Error soma.Injector.getInjectedValue] A matching constructor parameter has been found in the target, you can't inject an instance in itself"
	};

	var MappingVO = function (prop, value, cl, singleton) {
		this.prop = prop;
		this.value = value;
		this.cl = cl;
		this.singleton = singleton || false;
	};

	var validateProp = function (prop) {
		if (typeof prop !== "string") {
			throw new Error(soma.InjectorError.MAPPING_BAD_PROP);
		}
	};

	var validateValue = function (prop, val) {
		if (!val) {
			throw new Error(soma.InjectorError.MAPPING_BAD_VALUE + prop);
		}
	};

	var validateClass = function (prop, val) {
		if (typeof val !== "function") {
			throw new Error(soma.InjectorError.MAPPING_BAD_CLASS + prop);
		}
	};

	var validateBooleanSingleton = function (prop, singleton) {
		if (typeof singleton !== "boolean") {
			throw new Error(soma.InjectorError.MAPPING_BAD_SINGLETON + prop);
		}
	};

	var validateConstructorInjectionLoop = function (name, cl) {
		var params = getConstructorParams(cl);
		if (params.contains(name)) {
			throw new Error(soma.InjectorError.INJECT_INSTANCE_IN_ITSELF_CONSTRUCTOR);
		}
	};

	var validatePropertyInjectionLoop = function (name, target) {
		if (target.hasOwnProperty(name)) {
			throw new Error(soma.InjectorError.INJECT_INSTANCE_IN_ITSELF_PROPERTY);
		}
	};

	var getConstructorParams = function (cl) {
		var args = [];
		var clStr = cl.toString().replace(STRIP_COMMENTS, '');
		var argsFlat = clStr.match(FN_ARGS);
		var spl = argsFlat[1].split(FN_ARG_SPLIT);
		for (var i = 0; i < spl.length; i++) {
			var arg = spl[i];
			arg.replace(FN_ARG, function (all, underscore, name) {
				args.push(name);
			});
		}
		return args;
	};

	var instantiateIgnoringConstructor = function () {
		if (typeof arguments[0] !== "function") {
			throw new Error(soma.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
		}
		var TargetClass = arguments[0];
		var args = [null];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		return new (Function.prototype.bind.apply(TargetClass, args));
	};

	soma.Injector = function () {
		this.mappings = {};
		this.parent = null;
	};

	soma.Injector.prototype = {

		createChild:function () {
			var injector = new soma.Injector();
			injector.parent = this;
			return injector;
		},

		getMappingVo:function (prop) {
			if (!this.mappings) return null;
			if (this.mappings[prop]) return this.mappings[prop];
			if (this.parent) return this.parent.getMappingVo(prop);
			return null;
		},

		mapValue:function (prop, val) {
			if (this.mappings[prop]) {
				throw new Error(soma.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateValue(prop, val);
			this.mappings[prop] = new MappingVO(prop, val);
			return this;
		},

		mapClass:function (prop, cl, singleton) {
			if (this.mappings[prop]) {
				throw new Error(soma.InjectorError.MAPPING_ALREADY_EXISTS + prop);
			}
			validateProp(prop);
			validateClass(prop, cl);
			if (singleton) validateBooleanSingleton(prop, singleton);
			this.mappings[prop] = new MappingVO(prop, null, cl, singleton);
			return this;
		},

		removeMapping:function (prop) {
			this.mappings[prop] = null;
			delete this.mappings[prop];
			return this;
		},

		hasMapping:function (prop) {
			return !!this.mappings[prop];
		},

		hasInheritedMapping:function (prop) {
			return !!this.getMappingVo(prop);
		},

		getMapping:function (value) {
			for (var name in this.mappings) {
				var vo = this.mappings[name];
				if (vo.value === value || vo.cl === value) {
					return vo.prop;
				}
			}
		},

		getMappingValue:function (prop) {
			var vo = this.mappings[prop];
			if (!vo) return undefined;
			if (vo.cl) return vo.cl;
			if (vo.value) return vo.value;
			return undefined;
		},

		instantiate:function (TargetClass) {
			if (typeof TargetClass !== "function") {
				throw new Error(soma.InjectorError.CREATE_INSTANCE_INVALID_PARAM);
			}
			var TargetClass = arguments[0];
			var args = [null];
			var params = getConstructorParams(TargetClass, this.mappings);
			for (var i = 0; i < params.length; i++) {
				if (arguments[i + 1]) {
					// argument found
					args.push(arguments[i + 1]);
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

		inject:function (target) {
			if (this.parent) {
				this.parent.inject(target);
			}
			for (var name in this.mappings) {
				var vo = this.getMappingVo(name);
				if (target.hasOwnProperty(vo.prop)) {
					var val = this.getInjectedValue(vo, name);
					target[name] = val;
				}
			}
			if (typeof target.postConstruct === 'function') {
				target.postConstruct();
			}
			return this;
		},

		getInjectedValue:function (vo, name) {
			var val = vo.value;
			var injectee;
			if (vo.cl) {
				var params = getConstructorParams(vo.cl);
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

		createInstance:function () {
			var instance = this.instantiate.apply(this, arguments);
			this.inject(instance);
			return instance;
		},

		getInstance:function (cl) {
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
				return this.parent.getInstance(cl);
			} else {
				throw new Error(soma.InjectorError.GET_INSTANCE_NO_MAPPING);
			}
		},

		dispose:function () {
			this.mappings = {};
		}

	};

	soma.Injector.extend = function(obj) {
		return soma.inherit(soma.Injector, obj);
	};

	// EVENTS

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

	soma.Event.prototype.isIE9 = function () {
		if (typeof document !== "object") return false;
		return document.body.style.scrollbar3dLightColor !== undefined && document.body.style.opacity !== undefined;
	};

	soma.Event.prototype.toString = function () {
		return "[soma.Event]";
	};

	var EventObject = function (type, bubbles, cancelable) {
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

	soma.EventDispatcher.prototype.addEventListener = function (type, listener, priority) {
		if (!this.listeners || !type || !listener) return;
		if (isNaN(priority)) priority = 0;
		for (var i = 0; i < this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				return;
			}
		}
		this.listeners.push({type:type, listener:listener, priority:priority, scope:this});
	};

	soma.EventDispatcher.prototype.removeEventListener = function (type, listener) {
		if (!this.listeners || !type || !listener) return;
		var i = this.listeners.length;
		while (i-- > 0) {
			var eventObj = this.listeners[i];
			if (eventObj.type === type && eventObj.listener === listener) {
				this.listeners.splice(i, 1);
			}
		}
	};

	soma.EventDispatcher.prototype.hasEventListener = function (type) {
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

	soma.EventDispatcher.prototype.dispatchEvent = function (event) {
		if (!this.listeners || !event) throw new Error("Error in EventDispatcher (dispatchEvent), one of the parameters is null or undefined.");
		var events = [];
		var i;
		for (i = 0; i < this.listeners.length; i++) {
			var eventObj = this.listeners[i];
			if (eventObj.type === event.type) {
				events.push(eventObj);
			}
		}
		events.sort(function (a, b) {
			return b.priority - a.priority;
		});
		for (i = 0; i < events.length; i++) {
			events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
		}
		return !event.isDefaultPrevented();
	};

	soma.EventDispatcher.prototype.dispose = function () {
		this.listeners = null;
	};

	soma.EventDispatcher.prototype.toString = function () {
		return "[soma.EventDispatcher]";
	};

	soma.EventDispatcher.extend = function(obj) {
		return soma.inherit(soma.EventDispatcher, obj);
	};

	// CORE

	soma.Application = soma.extend({
		constructor: function() {
			setup.bind(this)();
			this.init();
			this.start();

			function setup() {
				this.dispatcher = new soma.EventDispatcher();
				soma.applyProperties(this, this.dispatcher, ['dispatchEvent', 'addEventListener', 'removeEventListener', 'hasEventListener']);
				this.injector = new soma.Injector(this.dispatcher);
				this.injector.mapValue('instance', this);
				this.injector.mapValue('dispatcher', this.dispatcher);
			}

		},
		init: function() {

		},
		start: function() {

		}
	});

	// EXPORT

	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma", soma);
	}
	;

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma;
		}
		exports = soma;
	}
	;

})(this['soma'] = this['soma'] || {});