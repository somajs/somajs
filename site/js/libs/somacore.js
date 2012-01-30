/**
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 * 
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 * 
 * The Original Code is SomaCore.
 * 
 * The Initial Developer of the Original Code is Romuald Quantin (original actionscript version).
 * romu@soundstep.com (www.soundstep.com).
 * 
 * Javascript port of the AS3 MVC framework SomaCore (http://www.soundstep.com/blog/downloads/somacore/).
 * The Initial Developer of the port is Henry Schmieder (javascript version).
 * @author Henry Schmieder
 * @author Henry Romuald Quantin
 *
 * Initial Developer are Copyright (C) 2008-2012 Soundstep. All Rights Reserved.
 * All Rights Reserved.
 * 
 */

(function() {

	/** @namespace Global namespace and contains some helpers. */
	soma = {};

	if (!Function.prototype.bind) {
		Function.prototype.bind = function bind(that) {
			console.log('here');
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

	soma.applyProperties = function(target, extension) {
		for (var prop in extension) {
			target[prop] = extension[prop];
		}
	};

	soma.inherit = function(target, obj) {
		var subclass;
		if (obj && obj.hasOwnProperty('constructor')) {
			// use constructor if defined
			subclass = obj.constructor;
		} else {
			// call the super constructor
			subclass = function(){
				return target.apply(this, arguments);
			};
		}
		// add super properties
		soma.applyProperties(subclass.prototype, target.prototype);
		// set the prototype chain to inherit from the parent without calling parent's constructor
		var chain = function(){};
		chain.prototype = target.prototype;
		subclass.prototype = new chain();
		// add obj properties
		if (obj) soma.applyProperties(subclass.prototype, obj, target.prototype);
		// point constructor to the subclass
		subclass.prototype.constructor = subclass;
		// set super class reference
		subclass.parent = target.prototype;
		// add extend shortcut
		subclass.extend = function(obj) {
			return soma.inherit(subclass, obj);
		}
		return subclass;
	};

	soma.extend = function(obj) {
		return soma.inherit(function(){}, obj);
	};

	var SomaSharedCore = soma.extend({
		dispatchEvent: function() {
			this.instance.dispatchEvent.apply(this.instance, arguments);
		},
		addEventListener: function() {
			this.instance.addEventListener.apply(this.instance, arguments);
		},
		removeEventListener: function() {
			this.instance.removeEventListener.apply(this.instance, arguments);
		},
		hasCommand: function(commandName) {
			return this.instance.hasCommand(commandName);
		},
		getCommand: function(commandName) {
			return this.instance.getCommand(commandName);
		},
		getCommands: function() {
			return this.instance.getCommands();
		},
		addCommand: function(commandName, commandClass) {
			this.instance.controller.addCommand(commandName, commandClass);
		},
		removeCommand: function(commandName) {
			this.instance.controller.removeCommand(commandName);
		},
		hasWire: function(wireName) {
			return this.instance.hasWire(wireName);
		},
		getWire: function(wireName) {
			return this.instance.getWire(wireName);
		},
		addWire: function(wireName, wire) {
			return this.instance.addWire(wireName, wire);
		},
		removeWire: function(wireName) {
			this.instance.removeWire(wireName);
		},
		hasModel: function(modelName) {
			return this.instance.hasModel(modelName);
		},
		getModel: function(modelName) {
			return this.instance.getModel(modelName);
		},
		addModel: function(modelName, model) {
			return this.instance.addModel(modelName, model);
		},
		removeModel: function(modelName) {
			this.instance.removeModel(modelName);
		},
		getSequencer: function(event) {
			return !!this.instance.controller ? this.instance.controller.getSequencer(event) : null;
		},
		stopSequencerWithEvent: function(event) {
			return !!this.instance.controller ? this.instance.controller.stopSequencerWithEvent(event) : null;
		},
		stopSequencer: function(event) {
			if (this.instance.controller) {
				return this.instance.controller.stopSequencer(event);
			}
		},
		stopAllSequencers: function() {
			if (this.instance.controller) {
				this.instance.controller.stopAllSequencers();
			}
		},
		isPartOfASequence: function(event) {
			return !!this.instance.controller ? this.instance.controller.isPartOfASequence(event) : false;
		},
		getLastSequencer: function() {
			return !!this.instance.controller ? this.instance.controller.getLastSequencer() : null;
		},
		getRunningSequencers: function() {
			return !!this.instance.controller ? this.instance.controller.getRunningSequencers() : null;
		},
		hasView: function(viewName) {
			return this.instance.hasView(viewName);
		},
		getView: function(viewName) {
			return this.instance.getView(viewName);
		},
		addView: function(viewName, view) {
			return this.instance.addView(viewName, view);
		},
		removeView: function(viewName) {
			this.instance.removeView(viewName);
		}
	});

	soma.AutoBind = soma.extend({
		blackList: ["initialize", "parent", "$constructor", "addEventListener", "removeEventListener"],
		autobind: function() {
			if (this.wasAutoBound) {
				return;
			}
			var o = this;
			var ab = o["AutoBindPattern"];
			var coreAb = "([lL]istener|[hH]andler|[cB]allback)$";
			if (!ab) {
				ab = coreAb;
			} else {
				ab = coreAb + "|" + ab;
			}
			for (var k in o) {
				if (typeof o[k] == "function") {
					if (this._autobindIsBlacklisted(k)) {
						continue;
					}
					if (!k.match(ab)) {
						continue;
					}
					o[k] = o[k].bind(o);
				}
			}
		},
		_autobindIsBlacklisted: function(name) {
			var bl = this.blackList;
			for (var i = 0; i < bl.length; i++) {
				if (bl[i] == name) {
					return true;
				}
			}
			return false;
		}
	});

	soma.Command = SomaSharedCore.extend({
		instance: null,
		registerInstance: function(instance) {
			this.instance = instance;
		},
		execute: function(event) {

		}
	});

	var SequenceCommandProxy = soma.extend({
		event:null,
		sequenceId:null,
		constructor: function(event) {
			this.event = event;
		}
	});

	soma.SequenceCommand = soma.Command.extend({
		commands: null,
		currentCommand: null,
		id:null,
		constructor: function(id) {
			if (id == null) {
				throw new Error("SequenceCommand Children expect an unique id as constructor arg");
			}
			this.commands = [];
			this.id = id;
			soma.Command.call(this);
		},
		registerInstance: function(instance) {
			this.instance = instance;
			this.initializeSubCommands();
		},
		initializeSubCommands: function() {
			throw new Error("Subclasses of SequenceCommand must implement initializeSubCommands()");
		},
		addSubCommand: function(event) {
			var c = new SequenceCommandProxy(event);
			this.commands.push(c);
			this.instance.controller.registerSequencedCommand(this, c);
		},
		execute: function(event) {
			if (this.commands == null || this.commands.length === 0) {
				return;
			}
			this.currentCommand = this.commands.shift();
			if (this.hasCommand(this.currentCommand.event.type)) {
				this.dispatchEvent(this.currentCommand.event);
			}
		},
		executeNextCommand: function() {
			if (this.commands == null) {
				return;
			}
			this.instance.controller.unregisterSequencedCommand(this, this.currentCommand.event.type);
			if (this.commands.length > 0) {
				this.execute(this.commands[0].event);
			} else {
				this.commands = null;
				this.currentCommand = null;
			}
		},
		getLength: function() {
			if (this.commands == null) {
				return -1;
			}
			return this.commands.length;
		},
		stop: function() {
			this.commands = null;
			this.commands = null;
			this.currentCommand = null;
			return this.instance.controller.unregisterSequencer(this);
		},
		getCurrentCommand: function() {
			return this.currentCommand;
		},
		getCommands: function() {
			return this.commands;
		}
	});

	soma.ParallelCommand = soma.Command.extend({
		commands:null,
		constructor: function() {
			this.commands = [];
		},
		registerInstance: function(instance) {
			this.instance = instance;
			this.initializeSubCommands();
		},
		initializeSubCommands: function() {
			throw new Error("Subclasses of ParallelCommand must implement initializeSubCommands()");
		},
		addSubCommand: function(e) {
			this.commands.push(e);
		},
		execute: function() {
			while (this.commands.length > 0) {
				var c = this.commands.shift();
				if (this.hasCommand(c.type)) {
					this.dispatchEvent(c);
				}
			}
			this.commands = null;
		},
		getLength: function() {
			return this.commands != null ? this.commands.length : -1;
		},
		getCommands: function() {
			return this.commands;
		}
	});

	soma.Wire = SomaSharedCore.extend({
		name: null,
		instance: null,
		constructor: function(name) {
			this.name = name;
		},
		registerInstance: function(instance) {
			this.instance = instance;
		},
		init: function() {

		},
		dispose: function() {

		},
		getName: function() {
			return this.name;
		},
		setName: function(name) {
			this.name = name;
		}
	});
	soma.applyProperties(soma.Wire.prototype, soma.AutoBind.prototype);

	soma.IDisposable = soma.extend({
		dispose: function() {}
	});

	soma.SomaController = soma.extend({
		instance:null,
		constructor: function(instance) {
			this.boundInstance = this.instanceHandler.bind(this);
			this.boundDomtree = this.domTreeHandler.bind(this);
			this.commands = {};
			this.sequencers = {};
			this.sequencersInfo = {};
			this.lastEvent = null;
			this.lastSequencer = null;
			this.instance = instance;
		},
		addInterceptor: function(commandName) {
			if (!soma) {
				throw new Error("soma package has been overwritten by local variable");
			}
			if (this.instance.body.addEventListener) {
				this.instance.body.addEventListener(commandName, this.boundDomtree, true);
			}
			this.instance.addEventListener(commandName, this.boundInstance, Number.NEGATIVE_INFINITY);
		},
		removeInterceptor: function(commandName) {
			if (this.instance.body.removeEventListener) {
				this.instance.body.removeEventListener(commandName, this.boundDomtree, true);
			}
			this.instance.removeEventListener(commandName, this.boundInstance);
		},
		executeCommand: function(e) {
			var commandName = e.type;
			if (this.hasCommand(commandName)) {
				var command = new this.commands[commandName]();
				command.registerInstance(this.instance);
				command.execute(e);
			}
		},
		registerSequencedCommand: function(sequencer, c) {
			if (!( c instanceof SequenceCommandProxy )) {
				throw new Error("capsulate sequence commands in SequenceCommandProxy objects!");
			}
			var s = this.sequencersInfo;
			if (s[sequencer.id] == null || this.sequencers[sequencer.id] == null) {
				this.lastSequencer = sequencer;
				s[sequencer.id] = [];
				this.sequencers[sequencer.id] = sequencer;
			}
			c.sequenceId = sequencer.id;
			s[sequencer.id].push(c);
		},
		unregisterSequencedCommand: function(sequencer, commandName) {
			if (typeof commandName != "string") {
				throw new Error("Controller::unregisterSequencedCommand() expects commandName to be of type String, given:" + commandName);
			}
			var s = this.sequencersInfo;
			if (s[sequencer.id] != null && s[sequencer.id] != undefined) {
				var len = s[sequencer.id].length;
				for (var i = 0; i < len; i++) {
					if (s[sequencer.id][i].event.type == commandName) {
						s[sequencer.id][i] = null;
						s[sequencer.id].splice(i, 1);
						if (s[sequencer.id].length == 0) {
							s[sequencer.id] = null;
							delete s[sequencer.id];
						}
						break;
					}
				}
			}
		},
		unregisterSequencer: function(sequencer) {
			var s = this.sequencers;
			if (s[sequencer.id] != null && s[sequencer.id] != undefined) {
				s[sequencer.id] = null;
				delete s[sequencer.id];
				s = this.sequencersInfo;
				if (s[sequencer.id] != null) {
					var len = s[sequencer.id].length;
					for (var i = 0; i < len; i++) {
						s[sequencer.id][i] = null;
					}
					s[sequencer.id] = null;
					delete s[sequencer.id];
					return true;
				}
			}
			return false;
		},
		hasCommand: function(commandName) {
			return this.commands[ commandName ] != null;
		},
		getCommand: function(commandName) {
			if (this.hasCommand(commandName)) {
				return this.commands[commandName];
			}
			return null;
		},
		getCommands: function() {
			var a = [];
			var cmds = this.commands;
			for (var c in cmds) {
				a.push(c);
			}
			return a;
		},
		addCommand: function(commandName, command) {
			if (this.hasCommand(commandName)) {
				throw new Error("Error in " + this + " Command \"" + commandName + "\" already registered.");
			}
			this.commands[ commandName ] = command;
			this.addInterceptor(commandName);
		},
		removeCommand: function(commandName) {
			if (!this.hasCommand(commandName)) {
				return;
			}
			this.commands[commandName] = null;
			delete this.commands[commandName];
			this.removeInterceptor(commandName);
		},
		getSequencer: function(event) {
			var ss = this.sequencersInfo;
			for (var s  in ss) {
				var len = ss[s].length;
				for (var i = 0; i < len; i++) {
					if (ss[s][i] && ss[s][i].event.type === event.type) {
						var seq = this.sequencers[ ss[s][i].sequenceId ];
						return !!seq ? seq : null;
					}
				}
			}
			return null;
		},
		stopSequencerWithEvent: function(event) {
			var ss = this.sequencersInfo;
			for (var s in ss) {
				var len = ss[s].length;
				for (var i = 0; i < len; i++) {
					if (ss[s][i].event.type === event.type) {
						try {
							this.sequencers[ ss[s][i].sequenceId ].stop();
						} catch(e) {
							return false;
						}
						return true;
					}
				}
			}
			return false;
		},
		stopSequencer: function(sequencer) {
			if (sequencer == null) {
				return false;
			}
			sequencer.stop();
			return true;
		},
		stopAllSequencers: function() {
			var ss = this.sequencers;
			var sis = this.sequencersInfo;
			for (var s in ss) {
				if (sis[s] == null) {
					continue;
				}
				var cl = sis[s].length;
				sis[s] = null;
				delete sis[s];
				ss[s].stop();
				ss[s] = null;
				delete ss[s];
			}
		},
		isPartOfASequence: function(event) {
			return ( this.getSequencer(event) != null );
		},
		getRunningSequencers: function() {
			var a = [];
			var ss = this.sequencers;
			for (var s in ss) {
				a.push(ss[s]);
			}
			return a;
		},
		getLastSequencer: function() {
			return this.lastSequencer;
		},
		dispose: function() {
			for (var nameCommand in this.commands) {
				this.removeCommand(nameCommand);
			}
			for (var nameSequencer in this.sequencers) {
				this.sequencers[nameSequencer] = null;
				delete this.sequencers[nameSequencer];
			}
			this.commands = null;
			this.sequencers = null;
			this.lastEvent = null;
			this.lastSequencer = null;
		},
		domTreeHandler: function(e) {
			console.log("dom tree handler", e);
			if (e.bubbles && this.hasCommand(e.type) && !e.isCloned) {
				if( e.stopPropagation ) {
                    e.stopPropagation();
                }else{
                    e.cancelBubble = true;
                }
				var clonedEvent = e.clone();
				// store a reference of the events not to dispatch it twice
				// in case it is dispatched from the display list
				this.lastEvent = clonedEvent;
				this.instance.dispatchEvent(clonedEvent);
				if (!clonedEvent.isDefaultPrevented()) {
					this.executeCommand(e);
				}
				this.lastEvent = null;
			}
		},
		instanceHandler: function(e) {
			console.log("instance handler", e);
			if (e.bubbles && this.hasCommand(e.type)) {
				// if the event is equal to the lastEvent, this has already been dispatched for execution
				if (this.lastEvent != e) {
					if (!e.isDefaultPrevented()) {
						this.executeCommand(e);
					}
				}
			}
			this.lastEvent = null;
		}
	});

	soma.SomaViews = soma.extend({
		autoBound:false,
		instance:null,
		constructor: function(instance) {
			this.views = {};
			this.instance = instance;
		},
		hasView: function(viewName) {
			return this.views[ viewName ] != null;
		},
		addView: function(viewName, view) {
			if (this.hasView(viewName)) {
				throw new Error("View \"" + viewName + "\" already exists");
			}
			if (document.attachEvent) {
				view.instance = this.instance;
			}
			if (!this.autoBound) {
				soma.applyProperties(soma.View.prototype, soma.AutoBind.prototype);
				this.autoBound = true;
			}
			if (view['shouldAutobind']) {
                view.autobind();
            }
			this.views[ viewName ] = view;
			if (view[ "init" ] != null) {
				view.init();
			}
			return view;
		},
		getView: function(viewName) {
			if (this.hasView(viewName)) {
				return this.views[ viewName ];
			}
			return null;
		},
		getViews: function() {
			var clone = {};
			for (var name in this.views) {
				clone[name] = this.views[name];
			}
			return clone;
		},
		removeView: function(viewName) {
			if (!this.hasView(viewName)) {
				return;
			}
			if (this.views[viewName]["dispose"] != null) {
				this.views[viewName].dispose();
			}
			this.views[ viewName ] = null;
			delete this.views[ viewName ];
		},
		dispose: function() {
			for (var name in this.views) {
				this.removeView(name);
			}
			this.views = null;
            this.instance = null;
		}
	});

	soma.EventDispatcher = soma.extend({
		constructor: function() {
			listeners = [];
		},
		getListeners: function() {
			return listeners;
		},
		addEventListener: function(type, listener, priority) {
			if (!listeners || !type || !listener) return;
			if (isNaN(priority)) priority = 0;
			listeners.push({type: type, listener: listener, priority: priority,scope:this});
		},
		removeEventListener: function(type, listener) {
			if (!listeners || !type || !listener) return;
			var i = 0;
			var l = listeners.length;
			for (i=l-1; i > -1; i--) {
				var eventObj = listeners[i];
				if (eventObj.type == type && eventObj.listener == listener) {
					listeners.splice(i, 1);
				}
			}
		},
		hasEventListener: function(type) {
			if (!listeners || !type) return false;
			var i = 0;
			var l = listeners.length;
			for (; i < l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type) {
					return true;
				}
			}
			return false;
		},
		dispatchEvent: function(event) {
			if (!listeners || !event) return;
			var events = [];
			var i;
			for (i = 0; i < listeners.length; i++) {
				var eventObj = listeners[i];
				if (eventObj.type == event.type) {
					events.push(eventObj);
				}
			}
			events.sort(function(a, b) {
				return b.priority - a.priority;
			});

			for (i = 0; i < events.length; i++) {
                events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
			}
		},
        getListeners: function()
        {
            return listeners.slice();
        },
		toString: function() {
			return "[Class soma.EventDispatcher]";
		},
		dispose: function() {
			listeners = null;
		}
	});

	soma.Application = soma.EventDispatcher.extend({
		body:null,
		models:null,
		controller:null,
		wires:null,
		views:null,
		constructor: function() {
			soma.EventDispatcher.call(this);
			//this.parent.constructor(this);
			this.body = document.body;
			if (!this.body) {
				throw new Error("SomaCore requires body of type Element");
			}
			this.controller = new soma.SomaController(this);
			this.models = new soma.SomaModels(this);
			this.wires = new soma.SomaWires(this);
			this.views = new soma.SomaViews(this);
			this.init();
			this.registerModels();
			this.registerViews();
			this.registerCommands();
			this.registerWires();
			this.start();
		},
		hasCommand: function(commandName) {
			return (!this.controller) ? false : this.controller.hasCommand(commandName);
		},
		getCommand: function(commandName) {
			return (!this.controller) ? null : this.controller.getCommand(commandName);
		},
		getCommands: function() {
			return (!this.controller) ? null : this.controller.getCommands();
		},
		addCommand: function(commandName, command) {
			this.controller.addCommand(commandName, command);
		},
		removeCommand: function(commandName) {
			this.controller.removeCommand(commandName);
		},
		hasWire: function(wireName) {
			return (!this.wires) ? false : this.wires.hasWire(wireName);
		},
		getWire: function(wireName) {
			return (!this.wires) ? null : this.wires.getWire(wireName);
		},
		getWires: function() {
			return (!this.wires) ? null : this.wires.getWires();
		},
		addWire: function(wireName, wire) {
			return this.wires.addWire(wireName, wire);
		},
		removeWire: function(wireName) {
			this.wires.removeWire(wireName);
		},
		hasModel: function(modelName) {
			return (!this.models) ? false : this.models.hasModel(modelName);
		},
		getModel: function(modelName) {
			return (!this.models) ? null : this.models.getModel(modelName);
		},
		getModels: function() {
			return (!this.models) ? null : this.models.getModels();
		},
		addModel: function(modelName, model) {
			return this.models.addModel(modelName, model);
		},
		removeModel: function(modelName) {
			this.models.removeModel(modelName);
		},
		hasView: function(viewName) {
			return (!this.views) ? false : this.views.hasView(viewName);
		},
		getView: function(viewName) {
			return (!this.views) ? null : this.views.getView(viewName);
		},
		getViews: function() {
			return (!this.views) ? null : this.views.getViews();
		},
		addView: function(viewName, view) {
			return this.views.addView(viewName, view);
		},
		removeView: function(viewName) {
			this.views.removeView(viewName);
		},
		getSequencer: function(event) {
			return !!this.controller ? this.controller.getSequencer(event) : null;
		},
		isPartOfASequence: function(event) {
			return ( this.getSequencer(event) != null );
		},
		stopSequencerWithEvent: function(event) {
			return !!this.controller ? this.controller.stopSequencerWithEvent(event) : false;
		},
		stopSequencer: function(sequencer) {
			return !!this.controller ? this.controller.stopSequencer(sequencer) : false;
		},
		stopAllSequencers: function() {
			if (this.controller) {
				this.controller.stopAllSequencers();
			}
		},
		getRunningSequencers: function() {
			return !!this.controller ? this.controller.getRunningSequencers() : null;
		},
		getLastSequencer: function() {
			return !!this.controller ? this.controller.getLastSequencer() : null;
		},
		dispose: function() {
			soma.EventDispatcher.prototype.dispose.call(this);
			if (this.models) {
				this.models.dispose();
				this.models = null;
			}
			if (this.views) {
				this.views.dispose();
				this.views = null;
			}
			if (this.controller) {
				this.controller.dispose();
				this.controller = null;
			}
			if (this.wires) {
				this.wires.dispose();
				this.wires = null;
			}
			this.body = null;
		},
		init: function() {
		},
		registerModels: function() {
		},
		registerViews: function() {
		},
		registerCommands: function() {
		},
		registerWires: function() {
		},
		start: function() {
		}
	});

	soma.SomaModels = soma.extend({
		instance:null,
		constructor: function(instance) {
			this.models = {};
			this.instance = instance;
		},
		hasModel: function(modelName) {
			return this.models[ modelName ] != null;
		},
		getModel: function(modelName) {
			if (this.hasModel(modelName)) {
				return this.models[ modelName ];
			}
			return null;
		},
		getModels: function() {
			var clone = {};
			var ms = this.models;
			for (var name in ms) {
				clone[name] = ms[name];
			}
			return clone;
		},
		addModel: function(modelName, model) {
			if (this.hasModel(modelName)) {
				throw new Error("Model \"" + modelName + "\" already exists");
			}
			this.models[ modelName ] = model;
			if (!model.dispatcher) model.dispatcher = this.instance;
			model.init();
			return model;
		},
		removeModel: function(modelName) {
			if (!this.hasModel(modelName)) {
				return;
			}
			this.models[ modelName ].dispose();
			this.models[ modelName ] = null;
			delete this.models[ modelName ];
		},
		dispose: function() {
			for (var name in this.models) {
				this.removeModel(name);
			}
			this.models = null;
            this.instance = null;
		}
	});

	soma.Model = soma.extend({
		name: null,
		data: null,
		dispatcher:null,
		constructor: function(name, data, dispatcher) {
			this.data = data;
			this.dispatcher = dispatcher;
			if (name != null) {
				this.name = name;
			}
		},
		init: function() {

		},
		dispose: function() {

		},
		dispatchEvent: function() {
			if (this.dispatcher) {
				this.dispatcher.dispatchEvent.apply(this.dispatcher, arguments);
			}
		},
		addEventListener: function() {
			if (this.dispatcher) {
				this.dispatcher.addEventListener.apply(this.dispatcher, arguments);
			}
		},
		removeEventListener: function() {
			if (this.dispatcher) {
				this.dispatcher.addEventListener.apply(this.dispatcher, arguments);
			}
		},
		getName: function() {
			return this.name;
		},
		setName: function(name) {
			this.name = name;
		}
	});

	soma.View = soma.extend({
		instance: null,
		domElement: null,
		constructor: function(domElement) {
			var d;
			if( domElement != undefined ) {
				if( domElement.nodeType ) {
					d = domElement;
				}else{
					throw new Error( "domElement has to be a DOM-ELement");
				}
			}else{
				d = document.body;
			}
			this.domElement = d;
		},
		dispatchEvent: function(event) {
			if (this.domElement.dispatchEvent) {
				this.domElement.dispatchEvent(event);
			} else if (this.instance) {
				this.instance.dispatchEvent(event);
			}
		},
		addEventListener: function() {

	        if (this.domElement.addEventListener) {
	            this.domElement.addEventListener.apply(this.domElement, arguments);
	        } else if(this.instance) {
	            // TODO IE problem : target is now document.body
	            this.instance.addEventListener.apply(this.domElement, arguments);
	        }
		},
		removeEventListener: function() {
	        if(this.domElement.addEventListener) {
			    this.domElement.removeEventListener.apply(this.domElement, arguments);
	        } else if(this.instance) {
	            // TODO IE problem : target is now document.body
	             this.instance.removeEventListener.apply(this.domElement, arguments);
	        }
		},
		dispose: function() {

		}
	});

	soma.SomaWires = soma.extend({
		instance:null,
		constructor: function(instance) {
			this.wires = {};
			this.instance = instance;
		},
		hasWire: function(wireName) {
			return this.wires[ wireName ] != null;
		},
		addWire: function(wireName, wire) {
			if (this.hasWire(wireName)) {
				throw new Error("Wire \"" + wireName + "\" already exists");
			}
			if (wire['shouldAutobind']) wire.autobind();
			this.wires[ wireName ] = wire;
			wire.registerInstance(this.instance);
			wire.init();
			return wire;
		},
		getWire: function(wireName) {
			if (this.hasWire(wireName)) {
				return this.wires[ wireName ];
			}
			return null;
		},
		getWires: function() {
			var clone = {};
			for (var name in this.wires) {
				clone[name] = this.wires[name];
			}
			return clone;
		},
		removeWire: function(wireName) {
			if (!this.hasWire(wireName)) {
				return;
			}
			this.wires[ wireName ].dispose();
			this.wires[ wireName ] = null;
			delete this.wires[ wireName ];
		},
		dispose: function() {
			for (var name in this.wires) {
				this.removeWire(name);
			}
			this.wires = null;
            this.instance = null;
		}
	});

	soma.Mediator = soma.Wire.extend({
		viewComponent: null,
		constructor: function(name) {
			soma.Wire.call(this, name);
			this.viewComponent = viewComponent;
		},
		dispose: function() {
			this.viewComponent = null;
		}
	});

	soma.Event = soma.extend({
		constructor: function(type, params, bubbles, cancelable) {
			var e = soma.Event.createGenericEvent(type, bubbles, cancelable);
			if (params != null && params != undefined) {
				e.params = params;
			}
		    e.isCloned = false;
		    e.clone = this.clone.bind(e);
		    e.isIE9 = this.isIE9;
	        e.isDefaultPrevented = this.isDefaultPrevented;
		    if (this.isIE9() || !e.preventDefault || (e.getDefaultPrevented == undefined && e.defaultPrevented == undefined ) ) {
			    e.preventDefault = this.preventDefault.bind(e);
		    }
		    if (this.isIE9()) e.IE9PreventDefault = false;
			return e;
		},
		clone: function() {
	        var e = soma.Event.createGenericEvent(this.type, this.bubbles, this.cancelable);
			e.params = this.params;
			e.isCloned = true;
			e.clone = this.clone;
	        e.isDefaultPrevented = this.isDefaultPrevented;
		    e.isIE9 = this.isIE9;
		    if (this.isIE9()) e.IE9PreventDefault = this.IE9PreventDefault;
			return e;
		},
		preventDefault: function() {
			if (!this.cancelable) return false;
			this.defaultPrevented = true;
			if (this.isIE9()) this.IE9PreventDefault = true;
	        this.returnValue = false;
	        return this;
		},
		isDefaultPrevented: function() {
		    if (!this.cancelable) return false;
		    if (this.isIE9()) {
			    return this.IE9PreventDefault;
		    }
	        if( this.defaultPrevented != undefined ) {
	           return this.defaultPrevented;
	        }else if( this.getDefaultPrevented != undefined ) {
	            return this.getDefaultPrevented();
	        }
	        return false;
		},
		isIE9: function() {
		    return document.body.style.scrollbar3dLightColor!=undefined && document.body.style.opacity != undefined;
	    }
	});

	soma.Event.createGenericEvent = function (type, bubbles, cancelable) {
	    var e;
	    bubbles = bubbles !== undefined ? bubbles : true;
	    if (document.createEvent) {
	        e = document.createEvent("Event");
	        e.initEvent(type, bubbles, !!cancelable);
	    } else {
	        e = document.createEventObject();
	        e.type = type;
	        e.bubbles = !!bubbles;
	        e.cancelable = !!cancelable;
	    }
	    return e;
	};

	soma.IResponder = soma.extend({
		fault: function(info) {
		},
		result: function(data) {
		}
	});

})();