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

	var MediatorType = soma.extend({
		constructor: function(name, injector) {
			this.name = name;
			this.injector = injector;
			this.mappings = {};
			this.list = new soma.utils.HashMap('hm-'+name);
		},
		map: function(id, mediator, data) {
			if (!this.mappings[id] && typeof mediator === 'function') {
				console.log('MAP', id, data);
				this.mappings[id] = {
					mediator: mediator,
					data: data
				};
			}
			return this;
		},
		unmap: function(id) {
			if (this.mappings[id]) {
				delete this.mappings[id].mediator;
				delete this.mappings[id].data;
				delete this.mappings[id];
			}
			return this;
		},
		hasMapping: function(id) {
			return this.mappings[id] !== undefined && this.mappings[id] !== null;
		},
		getMapping: function(id) {
			return this.mappings[id];
		},
		getMappingData: function(id) {
			if (this.mappings[id]) {
				var data = this.mappings[id].data;
				if (data !== undefined) {
					if (typeof data === 'function') {
						return data;
					}
					var resolvedData = {};
					for (var name in data) {
						if (typeof data[name] === 'string' && this.injector.hasMapping(data[name])) {
							resolvedData[name] = this.injector.getValue(data[name]);
						}
						else {
							resolvedData[name] = data[name];
						}
					}
					return resolvedData;
				}
			}
		},
		has: function(element) {
			return this.list.has(element);
		},
		add: function(element, mediator) {
			if (!this.list.has(element)) {
				this.list.put(element, {
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
		removeAll: function() {
			if (this.list) {
				this.list.dispose();
			}
		},
		dispose: function() {
			// todo
		}
	});

	var Mediators = soma.extend({
		constructor: function() {
			this.types = {};
			this.defaultType = 'data-mediator';
			this.attributeSeparator = '|';
			this.injector = null;
			this.dispatcher = null;
			this.isObserving = false;
			this.observer = null;
		},
		postConstruct: function() {
			this.describe(this.defaultType);
		},
		describe: function(name) {
			if (this.types[name]) {
				throw new Error('The type of mediator has been described already (' + name + ').');
			}
			this.types[name] = new MediatorType(name, this.injector);
			return this.types[name];
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
					console.log('result', result);
					if (result !== undefined && result !== null) {
						//injector.mapValue('data', result);
						applyMappingData(injector, result);
					}
				}
				else if (data !== undefined && data !== null) {
					//injector.mapValue('data', data);
					applyMappingData(injector, data);
				}
				var mediator = injector.createInstance(cl);
				if (targets.length === 1) {
					return mediator;
				}
				list.push(mediator);
			}
			return list;
		},
		getType: function(name) {
			var typeId = name ? name : this.defaultType;
			if (!this.types[typeId]) {
				throw new Error('The type of mediator has been not been found (' + typeId + ').');
			}
			return this.types[typeId];
		},
		removeType: function(name) {
			// todo
		},
		map: function(id, mediator, data, type) {
			console.log('MAIN MAP', id, mediator, data, type);
			return this.getType(type).map(id, mediator, data);
		},
		unmap: function(id, type) {
			return this.getType(type).unmap(id);
		},
		hasMapping: function(id, type) {
			return this.getType(type).hasMapping(id);
		},
		getMapping: function(id, type) {
			return this.getType(type).getMapping(id);
		},
		getMappingData: function(id, type) {
			return this.getType(type).getMappingData(id);
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
			console.log('PARSE TO REMOVE', element);
			if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
				return;
			}
			for (var typeId in this.types) {
				var attr = element.getAttribute(typeId);
				if (attr) {
					var parts = attr.split(this.attributeSeparator);
					if (parts[0] && this.types[typeId].has(element) && this.types[typeId].hasMapping(parts[0])) {
						this.types[typeId].remove(element);
					}
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
			this.getType(type).add(element, mediator);
		},
		remove: function(element, type) {
			this.getType(type).remove(element);
		},
		get: function(element, type) {
			var mediator = this.getType(type).get(element);
			if (mediator) {
				return mediator;
			}
			else {
				for (var typeId in this.types) {
					var m = this.types[typeId].get(element);
					if (m) {
						return m;
					}
				}
			}
		},
		has: function(element, type) {
			return this.getType(type).has(element);
		},
		removeAll: function(type) {
			this.getType(type).removeAll();
		},
		dispose: function() {
			if (this.observer) {
				this.observer.disconnect();
			}
			for (var id in this.types) {
				this.types[id].removeAll();
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
