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

	// mutation observers
	// TODO: check with node.js
	if (typeof MutationObserver === 'undefined') {
		if (typeof window !== 'undefined' && typeof window.WebKitMutationObserver !== 'undefined') {
			window.MutationObserver = window.WebKitMutationObserver || window.MozMutationObserver;
		}
	}

	// framework
	soma.Application = soma.extend({
		constructor: function() {

			var self = this;

			function setup() {
				// injector
				self.injector = new infuse.Injector(self.dispatcher);
				// dispatcher
				self.dispatcher = new soma.EventDispatcher();
				// mapping
				self.injector.mapValue('injector', self.injector);
				self.injector.mapValue('instance', self);
				self.injector.mapValue('dispatcher', self.dispatcher);
				// mediator
				self.injector.mapClass('mediators', Mediators, true);
				self.mediators = self.injector.getValue('mediators');
				// commands
				self.injector.mapClass('commands', Commands, true);
				self.commands = self.injector.getValue('commands');
				// plugins
				for (var i = 0, l = plugins.length; i < l; i++) {
					self.createPlugin(plugins[i]);
				}
			}

			setup();
			this.init();
			this.start();

		},
		createPlugin: function() {
			if (arguments.length === 0 || !arguments[0]) {
				throw new Error('Error creating a plugin, plugin class is missing.');
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
			if (this.injector) {
				this.injector.dispose();
			}
			if (this.dispatcher) {
				this.dispatcher.dispose();
			}
			if (this.mediators) {
				this.mediators.dispose();
			}
			if (this.commands) {
				this.commands.dispose();
			}
			this.injector = undefined;
			this.dispatcher = undefined;
			this.mediators = undefined;
			this.commands = undefined;
			this.instance = undefined;
		}
	});

	var Mediators = soma.extend({
		constructor: function() {
			this.types = {};
			this.attributeSeparator = '|';
			this.injector = null;
			this.dispatcher = null;
			this.isObserving = false;
			this.observer = null;
			this.mappings = {};
			this.mappingsData = {};
			this.defaultType = 'data-mediator';
			this.describe(this.defaultType);
		},
		describe: function(name) {
			if (this.types[name]) {
				throw new Error('The type of mediator has been described already (' + name + ').');
			}
			this.types[name] = {
				id: name,
				list: new soma.utils.HashMap('shk')
			};
		},
		create: function(cl, target, data) {
			if (!cl || typeof cl !== 'function') {
				throw new Error('Error creating a mediator, the first parameter must be a function.');
			}
			if (target === undefined || target === null) {
				throw new Error('Error creating a mediator, the second parameter cannot be undefined or null.');
			}
			var targets = [];
			var list = [];
			if (target.length > 0) {
				targets = target;
			}
			else {
				targets.push(target);
			}
			for (var i= 0, l=targets.length; i<l; i++) {
				var injector = this.injector.createChild();
				injector.mapValue('target', targets[i]);
				if (typeof data === 'function') {
					var result = data(injector, i);
					if (result !== undefined && result !== null) {
						injector.mapValue('data', result);
					}
				}
				else if (data !== undefined && data !== null) {
					injector.mapValue('data', data);
				}
				var mediator = injector.createInstance(cl);
				if (targets.length === 1) {
					return mediator;
				}
				list.push(mediator);
			}
			return list;
		},
		map: function(id, mediator, data) {
			if (!this.mappings[id] && typeof mediator === 'function') {
				this.mappings[id] = mediator;
				this.setMappingData(id, data);
			}
		},
		unmap: function(id) {
			if (this.mappings[id]) {
				delete this.mappings[id];
			}
		},
		hasMapping: function(id) {
			return this.mappings[id] !== undefined && this.mappings[id] !== null;
		},
		getMapping: function(id) {
			return this.mappings[id];
		},
		observe: function(element, parse, config) {
			if (parse === undefined || parse === null || parse) {
				this.parse(element);
			}
			if (typeof MutationObserver !== 'undefined' && element) {
				this.observer = new MutationObserver(function(mutations) {
					for (var i= 0, l=mutations.length; i<l; i++) {
						// added
						var added = mutations[i].addedNodes;
						for (var j= 0, k=added.length; j<k; j++) {
							this.parse(added[j]);
						}
						// removed
						var removed = mutations[i].removedNodes;
						for (var d= 0, f=removed.length; d<f; d++) {
							this.parseToRemove(removed[j]);
						}
					}

				}.bind(this));
				this.observer.observe(element, config || {childList: true, subtree: true});
				this.isObserving = true;
			}
			else {
				if (this.observer) {
					this.observer.disconnect();
				}
				this.observer = null;
				this.isObserving = false;
			}
		},
		parseToRemove: function(element) {
			if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
				return;
			}
			var attr = element.getAttribute(this.attribute);
			if (attr) {
				var parts = attr.split(this.attributeSeparator);
				if (parts[0] && this.has(element)) {
					this.remove(element);
				}
			}
			var child = element.firstChild;
			while (child) {
				this.parseToRemove(child);
				child = child.nextSibling;
			}
		},
		parse: function(element) {
			if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
				return;
			}
			parseDOM(this, element);
			if (typeof MutationObserver === 'undefined') {
				var dataList = this.list.getData();
				for (var el in dataList) {
					var item = dataList[el];
					var element = item.element;
					if (!element.parentNode || (typeof HTMLDocument !== 'undefined' && element.parentNode && element.parentNode instanceof HTMLDocument) ) {
						this.remove(element);
					}
				}
			}
		},
		support: function(element) {
			if (typeof MutationObserver === 'undefined') {
				this.parse(element);
			}
		},
		add: function(element, mediator, type) {
			var typeTarget = type ? type : this.defaultType;
			var list = this.types[typeTarget].list;
			if (!list.has(element)) {
				list.put(element, {
					mediator: mediator,
					element: element
				});
			}
		},
		remove: function(element) {
			var item = this.list.get(element);
			if (item) {
				if (item.mediator) {
					if (typeof item.mediator['dispose'] === 'function') {
						item.mediator.dispose();
					}
				}
				delete item.mediator;
				delete item.element;
				this.list.remove(element);
			}
		},
		get: function(element) {
			var item = this.list.get(element);
			return item && item.mediator ? item.mediator : undefined;
		},
		getMappingData: function(id) {
			var data = this.mappingsData[id];
			if (typeof data === 'string' && this.injector.hasMapping(data)) {
				return this.injector.getValue(data);
			}
			return data;
		},
		setMappingData: function(id, data) {
			this.mappingsData[id] = data;
		},
		has: function(element, type) {
			var typeTarget = type ? type : this.defaultType;
			return this.types[typeTarget].list.has(element);
		},
		removeAll: function() {
			if (this.list) {
				this.list.dispose();
			}
		},
		dispose: function() {
			if (this.observer) {
				this.observer.disconnect();
			}
			this.removeAll();
			if (this.list) {
				this.list.dispose();
			}
			this.injector = undefined;
			this.dispatcher = undefined;
			this.observer = undefined;
			this.list = undefined;
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
				if (this.list.hasOwnProperty(cmd)) {
					copy[cmd] = this.list[cmd];
				}
			}
			return copy;
		},
		add: function(commandName, command) {
			if (typeof commandName !== 'string') {
				throw new Error('Error adding a command, the first parameter must be a string.');
			}
			if (typeof command !== 'function') {
				throw new Error('Error adding a command with the name "' + command + '", the second parameter must be a function, and must contain an "execute" public method.');
			}
			if (this.has(commandName)) {
				throw new Error('Error adding a command with the name: "' + commandName + '", already registered.');
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
		removeAll: function() {
			for (var cmd in this.list) {
				if (this.list.hasOwnProperty(cmd)) {
					this.remove(cmd);
				}
			}
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
					throw new Error('Error in ' + this + ' Command ' + command + ' must contain an execute public method.');
				}
				command.execute(event);
			}
		},
		dispose: function() {
			this.removeAll();
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
