// plugins

var plugins = [];
soma.plugins = soma.plugins || {};
soma.plugins.add = function(plugin) {
	plugins.push(plugin);
};
soma.plugins.remove = function(plugin) {
	var i = -1, l = plugins.length;
	while (++i < l) {
		if (plugin === plugins[i]) {
			plugins.splice(i, 1);
		}
	}
};

// helpers
function isElement(value) {
	return value ? value.nodeType > 0 : false;
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
			// plugins
			var i = -1, l = plugins.length;
			while (++i < l) {
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
		for (var i=1; i<arguments.length; i++) {
			args.push(arguments[i]);
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
		this.injector = null;
		this.dispatcher = null;
		this.mediators = null;
		this.commands = null;
		this.instance = null;
		// todo: remove plugins
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
	},
	dispose: function() {
		// todo dispose mediators
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
	},
	dispose: function() {
		for (var c in this.list) {
			this.remove(c);
		}
		this.boundHandler = null;
		this.dispatcher = null;
		this.injector = null;
		this.list = null;
	}
});
