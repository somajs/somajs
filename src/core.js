// plugins

var plugins = [];
soma.plugins = soma.plugins || {};
soma.plugins.add = function(plugin) {
	plugins.push(plugin);
};
soma.plugins.remove = function(plugin) {
	for (var i = plugins.length-1, l = 0; i >= l; i--) {
		if (plugin === plugins[i]) {
			plugins.splice(i, 1);
		}
	}
};

// framework
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
//			soma.applyProperties(this, this.dispatcher, true, ['dispatch', 'dispatchEvent', 'addEventListener', 'removeEventListener', 'hasEventListener']);
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
			// plugins
			for (var i = 0, l = plugins.length; i < l; i++) {
				this.createPlugin(plugins[i]);
			}
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
		for (var j=1; j<arguments.length; j++) {
			args.push(arguments[j]);
		}
		return this.injector.createInstance.apply(this.injector, args);
	},
	init: function() {

	},
	start: function() {

	},
	dispose: function() {
		// mapping
		if (this.injector) {
			this.injector.removeMapping('injector');
			this.injector.removeMapping('dispatcher');
			this.injector.removeMapping('mediators');
			this.injector.removeMapping('commands');
			this.injector.removeMapping('instance');
		}
		// variables
		if (this.injector) this.injector.dispose();
		if (this.dispatcher) this.dispatcher.dispose();
		if (this.mediators) this.mediators.dispose();
		if (this.commands) this.commands.dispose();
		this.injector = undefined;
		this.dispatcher = undefined;
		this.mediators = undefined;
		this.commands = undefined;
		this.instance = undefined;
	}
});

var Mediators = soma.extend({
	constructor: function() {
		this.injector = null;
		this.dispatcher = null;
	},
	create: function(cl, target) {
		if (!cl || typeof cl !== "function") {
			throw new Error("Error creating a mediator, the first parameter must be a function.");
		}
		if (target === undefined || target === null) {
			throw new Error("Error creating a mediator, the second parameter cannot be undefined or null.");
		}
		var targets = [];
		var meds = [];
		if (target.length > 0) {
			targets = target;
		}
		else {
			targets.push(target);
		}
		for (var i= 0, l=targets.length; i<l; i++) {
			var injector = this.injector.createChild();
			injector.mapValue("target", targets[i]);
			//var mediator = injector.createInstance.apply(this.injector, params);
			var mediator = injector.createInstance(cl);
//			soma.applyProperties(mediator, this.dispatcher, true, ['dispatch', 'dispatchEvent', 'addEventListener', 'removeEventListener', 'hasEventListener']);
			if (targets.length === 1) return mediator;
			meds.push(mediator);
		}
		return meds;
	},
	dispose: function() {
		this.injector = undefined;
		this.dispatcher = undefined;
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
		return this.list[commandName] !== null && this.list[commandName] !== undefined;
	},
	get: function(commandName) {
		if (this.has(commandName)) {
			return this.list[commandName];
		}
		return undefined;
	},
	getAll: function() {
		var copy = {};
		for (var cmd in this.list) {
			copy[cmd] = this.list[cmd];
		}
		return copy;
	},
	add: function(commandName, command) {
		if (typeof commandName !== 'string') {
			throw new Error("Error adding a command, the first parameter must be a string.");
		}
		if (typeof command !== 'function') {
			throw new Error("Error adding a command with the name \"" + command + "\", the second parameter must be a function, and must contain an \"execute\" public method.");
		}
		if (this.has(commandName)) {
			throw new Error("Error adding a command with the name: \"" + commandName + "\", already registered.");
		}
		this.list[ commandName ] = command;
		this.addInterceptor(commandName);
	},
	remove: function(commandName) {
		if (!this.has(commandName)) {
			return;
		}
		this.list[commandName] = undefined;
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
		if (event.isDefaultPrevented && !event.isDefaultPrevented()) {
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
//			soma.applyProperties(command, this.dispatcher, true, ['dispatch', 'dispatchEvent', 'addEventListener', 'removeEventListener', 'hasEventListener']);
			command.execute(event);
		}
	},
	dispose: function() {
		for (var cmd in this.list) {
			this.remove(cmd);
		}
		this.boundHandler = undefined;
		this.dispatcher = undefined;
		this.injector = undefined;
		this.list = undefined;
	}
});

// event extend utils

soma.EventDispatcher.extend = function (obj) {
	return soma.inherit(soma.EventDispatcher, obj);
};

soma.Event.extend = function (obj) {
	return soma.inherit(soma.Event, obj);
};

infuse.Injector.extend = function(obj) {
	return soma.inherit(infuse.Injector, obj);
};
