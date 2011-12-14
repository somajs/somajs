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
 * @contributors:
 * 		Romuald Quantin
 * 
 * Initial Developer are Copyright (C) 2008-2012 Soundstep. All Rights Reserved.
 * All Rights Reserved.
 * 
 */

(function() {
	
	/** @namespace Global namespace and contains some helpers. */
	soma = {};
	/** @namespace Contains the SomaCore class Application (entry point of the framework).  */
	soma.core = {};
	/** @namespace Contains classes related to commands and events. */
	soma.core.controller = {};
	/** @namespace Contains the models manager and a Model abstract class. */
	soma.core.model = {};
	/** @namespace Contains the views manager and a View abstract class (no framework dependency). */
	soma.core.view = {};
	/** @namespace Contains the wires manager and a Wire abstract class. */
	soma.core.wire = {};
	/** @namespace Contains a Mediator abstract class. */
	soma.core.mediator = {};
	
	/**
	 * Used for dynamic class instantiation with passing arbitrary amount of arguments to their constructors.
	 */
	function F() {
	}
	Function.instantiate = function(func, params) {
		F.prototype = func.prototype;
		var f = new F() , r = func.apply(f, params);
		return r || f;
	};
	Function.implement({
		'instantiate' : function(params) {
			return Function.instantiate(this, params);
		}
	});

	var SomaSharedCore = new Class({

		dispatchEvent: function() {
			this.instance.dispatchEvent.apply(this.instance, arguments);
		},

		addEventListener: function() {
			this.instance.addEventListener.apply(this.instance, arguments);
		},

		removeEventListener: function() {
			this.instance.removeEventListener.apply(this.instance, arguments);
		},

		/**
		 * @description checks if a command for the given key exists
		 * @param {String} commandName
		 * @return {Boolean}
		 */
		hasCommand: function(commandName) {
			return this.instance.hasCommand(commandName);
		},

		/**
		 * @description get a command object reference
		 * @param {String} commandName
		 * @return {soma.core.controller.Command}
		 */
		getCommand: function(commandName) {
			return this.instance.getCommand(commandName);
		},

		/**
		 * @return {Array} list of command object references
		 */
		getCommands: function() {
			return this.instance.getCommands();
		},

		/**
		 * @description subsribes a command by a unique name/key and its class object
		 * @param {String} command name
		 * @param {Class} command class
		 */
		addCommand: function(commandName, commandClass) {
			this.instance.controller.addCommand(commandName, commandClass);
		},

		/**
		 * @description unsubscribes a command
		 * @param {String} commandName
		 * @return (void)
		 */
		removeCommand: function(commandName) {
			this.instance.controller.removeCommand(commandName);
		},

		/**
		 * @description checks if a wire with the given wire name exists
		 * @param {String} wireName the unique wire name, the wire was registered for
		 * @return {Boolean}
		 */
		hasWire: function(wireName) {
			return this.instance.hasWire(wireName);
		},

		/**
		 *
		 * @param {String} wireName the unique wire name, the wire was registered for
		 * @return {soma.wire.Wire}
		 */
		getWire: function(wireName) {
			return this.instance.getWire(wireName);
		},

		/**
		 * @description subsribes a wire object by a uique name and its class object
		 * @param {String} wireName
		 * @param {soma.core.Wire} wire
		 * @return {soma.core.Wire}
		 */
		addWire: function(wireName, wire) {
			return this.instance.addWire(wireName, wire);
		},

		/**
		 * @description unsubscribes wire by its unique name
		 * @param {String} wireName
		 * @return {void}
		 */
		removeWire: function(wireName) {
			this.instance.removeWire(wireName);
		},

		/**
		 *
		 * @param {String} modelName
		 */
		hasModel: function(modelName) {
			return this.instance.hasModel(modelName);
		},

		/**
		 *
		 * @param {String} modelName
		 */
		getModel: function(modelName) {
			return this.instance.getModel(modelName);
		},

		/**
		 *
		 * @param {String} modelName
		 * @param {soma.core.model.Model} model
		 */
		addModel: function(modelName, model) {
			return this.instance.addModel(modelName, model);
		},

		removeModel: function(modelName) {
			this.instance.removeModel(modelName);
		},

		/**
		 *
		 * @param {Event} event
		 * @return soma.core.controller.SequenceCommand
		 */
		getSequencer: function(event) {
			return !!this.instance.controller ? this.instance.controller.getSequencer(event) : null;
		},

		/**
		 *
		 * @param {Event} event
		 * @return Boolean
		 */
		stopSequencerWithEvent: function(event) {
			return !!this.instance.controller ? this.instance.controller.stopSequencerWithEvent(event) : null;
		},

		/**
		 *
		 * @param {Event} event
		 */
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

		/**
		 * @see soma.core.Controller.isPartOfASequence
		 * @param {Event} event
		 * @return Boolean
		 */
		isPartOfASequence: function(event) {
			return !!this.instance.controller ? this.instance.controller.isPartOfASequence(event) : false;
		},

		/**
		 * @see soma.core.Controller.getLastSequencer
		 * @return soma.core.controller.SequenceCommand
		 */
		getLastSequencer: function() {
			return !!this.instance.controller ? this.instance.controller.getLastSequencer() : null;
		},

		/**
		 * @see soma.core.Controller.getRunningSequencers
		 * @return Array
		 */
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


	/**
	 * provides the functionality to autobind with implicit need to keep object scope like event listeners and handlers/callbacks
	 * ending with *Listener or *Handler
	 * Wires and Mediators are implementing instance scope autobinding upon registration
	 */
	var AutoBindProto = {
		blackList: ["initialize", "parent", "$constructor", "addEventListener", "removeEventListener" ]
		,autobind: function() {
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
		}
		,_autobindIsBlacklisted: function(name) {
			var bl = this.blackList;
			for (var i = 0; i < bl.length; i++) {
				if (bl[i] == name) {
					return true;
				}
			}
			return false;
		}
	};
	soma.core.AutoBind = new Class( AutoBindProto );

	/**
	 * @class Class that will be instantiated when a registered event is dispatched, the framework will automatically call the execute method.
	 * @description Creates a new Command, should be instantiated by the framework only.
	 * @borrows soma.core.Application#addWire
	 * @borrows soma.core.Application#getWire
	 * @borrows soma.core.Application#hasWire
	 * @borrows soma.core.Application#removeWire
	 * @example
	 * this.addCommand("eventType", MyCommand);
	 * @example
	 * var MyCommand = new Class({
	 * 	Extends:soma.core.controller.Command,
	 * 	execute: function(event) {
	 * 		// do something
	 * 	}
	 * });
	 */
	soma.core.controller.Command = new Class({
		Implements: SomaSharedCore,

		instance: null,

		registerInstance: function(instance) {
			this.instance = instance;
		},

		/*
		Function: execute
		Called automatically when the framework execute the command.
		
		Parameter:
			event (soma.Event) - event sent to the framework to trigger the command execution.
		*/
		execute: function(event) {
			
		}
		
		//___INSERT_SHARED_DOC___

	});

	var SequenceCommandProxy = new Class({
		event:null,
		sequenceId:null,
		initialize: function(event) {
			this.event = event;
		}
	});

	/*
	Class: soma.core.controller.SequenceCommand
	The SequenceCommand class is used to execute a list of commands one after the other. The command added can be asynchronous or synchronous.

	Example:

	*Register commands and a sequence command.*
	> this.addCommand("eventTypeDoSomethingAsync", CommandASyncExample);
	> this.addCommand("eventTypeDoAnotherThingAsync", CommandASyncExample);
	>
	> this.addCommand("eventTypeExcuteMysequence", SequenceCommandExample);
	> this.dispatchEvent(new MyEvent("eventTypeExcuteMysequence"));

	*/
	soma.core.controller.SequenceCommand = new Class({
		Extends: soma.core.controller.Command,
		Implements: SomaSharedCore,
		commands: null,
		currentCommand: null,
		id:null,

		initialize: function(id) {
			if (id == null) {
				throw new Error("SequenceCommand Children expect an unique id as constructor arg");
			}
			this.commands = [];
			this.id = id;
		},

		registerInstance: function(instance) {
			this.instance = instance;
			this.initializeSubCommands();
		},

		/**
		 * @private protected
		 * To be overridden
		 */
		initializeSubCommands: function() {
			throw new Error("Subclasses of SequenceCommand must implement initializeSubCommands()");
		},
		/**
		 *
		 * @param {Event} event
		 */
		addSubCommand: function(event) {
			var c = new SequenceCommandProxy(event);
			this.commands.push(c);
			this.instance.controller.registerSequencedCommand(this, c);
		},

		/**
		 *
		 * @param {Event} event
		 * @return void
		 */
		execute: function(event) {
			if (this.commands == null || this.commands.length === 0) {
				return;
			}
			this.currentCommand = this.commands.shift();
			if (this.hasCommand(this.currentCommand.event.type)) {
				this.dispatchEvent(this.currentCommand.event);
			}
		},

		/**
		 * @return void
		 */
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

		/**
		 * @return Number
		 */
		getLength: function() {
			if (this.commands == null) {
				return -1;
			}
			return this.commands.length;
		},

		/**
		 * @return Boolean
		 */
		stop: function() {
			this.commands = null;
			this.commands = null;
			this.currentCommand = null;
			return this.instance.controller.unregisterSequencer(this);
		},

		/**
		 * @return soma.core.controller.SequenceCommand
		 */
		getCurrentCommand: function() {
			return this.currentCommand;
		},

		/**
		 * @return Array
		 */
		getCommands: function() {
			return this.commands;
		}

		//___INSERT_SHARED_DOC___

	});


	soma.core.controller.ParallelCommand = new Class({
		Extends: soma.core.controller.Command,
		Implements: SomaSharedCore,
		commands:null,

		initialize: function() {
			this.commands = [];
		},
		registerInstance: function(instance) {
			this.instance = instance;
			this.initializeSubCommands();
		},
		/**
		 * @private protected
		 * To be overridden
		 */
		initializeSubCommands: function() {
			throw new Error("Subclasses of ParallelCommand must implement initializeSubCommands()");
		},
		/**
		 * @param {Event} command associated event
		 */
		addSubCommand: function(e) {
			this.commands.push(e);
		},

		/**
		 * @final
		 * @return void
		 */
		execute: function() {
			while (this.commands.length > 0) {
				/** @type Event */
				var c = this.commands.shift();
				if (this.hasCommand(c.type)) {
					this.dispatchEvent(c);
				}
			}
			this.commands = null;
		},

		/**
		 * @final
		 * @return int
		 */
		getLength: function() {
			return this.commands != null ? this.commands.length : -1;
		},

		/**
		 * @final
		 * @return Array array of registered commands
		 */
		getCommands: function() {
			return this.commands;
		}
		
		//___INSERT_SHARED_DOC___

	});


	soma.core.wire.Wire = new Class({
		name: null,

		Implements: [SomaSharedCore, soma.core.AutoBind ],

		instance: null,

		initialize: function(name) {
			if (name != null) {
				this.name = name;
			}
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
		
		//___INSERT_SHARED_DOC___
	});

	soma.core.Controller = (function() {
		var boundInstance = null;
		var boundDomtree = null;
		var commands = null;
		var sequencers = null;
		var sequencersInfo = null;
		var lastEvent = null;
		var lastSequencer = null;

		return new Class({
			Implements: soma.IDisposable,
			/**
			 * @private
			 * @type soma.core.Application
			 */
			instance:null,
			/**
			 * @constructs
			 * @param {soma.core.Application} core
			 */
			initialize:function(instance) {
				this.instance = instance;
				commands = {};
				sequencersInfo = {};
				sequencers = {};
				boundInstance = this.instanceHandler.bind(this);
				boundDomtree = this.domTreeHandler.bind(this);
			},

			/**
			 * @private
			 * @param {String} commandName
			 */
			addInterceptor: function(commandName) {
				if (!soma["core"]) {
					throw new Error("soma package has been overwritten by local variable");
				}

				// handle events dispatched from the domTree
				this.instance.body.addEventListener(commandName, boundDomtree, true);

				// handle events dispatched from the Soma facade
				this.instance.addEventListener(commandName, boundInstance, Number.NEGATIVE_INFINITY);

			},

			/**
			 * @private
			 * @param {String} commandName
			 */
			removeInterceptor: function(commandName) {
				this.instance.body.removeEventListener(commandName, boundDomtree, true);
				this.instance.removeEventListener(commandName, boundInstance);
			},

			/**
			 * @internal
			 * @param {Event} e
			 */
			executeCommand: function(e) {
				var commandName = e.type;
				if (this.hasCommand(commandName)) {
					var command = soma.createClassInstance(commands[ commandName ]);
					command.registerInstance(this.instance);
					command.execute(e);
				}
			},

			/**
			 *
			 * @param sequencer
			 * @param {SequenceCommandProxy} c
			 */
			registerSequencedCommand: function(sequencer, c) {
				if (!( c instanceof SequenceCommandProxy )) {
					throw new Error("capsulate sequence commands in SequenceCommandProxy objects!");
				}
				var s = sequencersInfo;
				if (s[sequencer.id] == null || sequencers[sequencer.id] == null) {
					lastSequencer = sequencer;
					s[sequencer.id] = [];
					sequencers[sequencer.id] = sequencer;
				}
				c.sequenceId = sequencer.id;
				s[sequencer.id].push(c);
			},

			/**
			 *
			 *
			 * @param sequencer
			 * @param {String} commandName unique command id
			 */
			unregisterSequencedCommand: function(sequencer, commandName) {
				if (typeof commandName != "string") {
					throw new Error("Controller::unregisterSequencedCommand() expects commandName to be of type String, given:" + commandName);
				}
				var s = sequencersInfo;
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

			/**
			 *
			 * @param {soma.core.controller.SequenceCommand} sequencer
			 * @return Boolean
			 */
			unregisterSequencer: function(sequencer) {
				var s = sequencers;
				if (s[sequencer.id] != null && s[sequencer.id] != undefined) {
					s[sequencer.id] = null;
					delete s[sequencer.id];
					s = sequencersInfo;
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
				return commands[ commandName ] != null;
			},

			/**
			 *
			 * @param {String} commandName
			 *
			 */
			getCommand: function(commandName) {
				if (this.hasCommand(commandName)) {
					return commands[commandName];
				}
				return null;
			},

			getCommands: function() {
				var a = [];
				var cmds = commands;
				for (var c in cmds) {
					a.push(c);
				}
				return a;
			},

			addCommand: function(commandName, command) {
				if (this.hasCommand(commandName)) {
					throw new Error("Error in " + this + " Command \"" + commandName + "\" already registered.");
				}
				commands[ commandName ] = command;
				this.addInterceptor(commandName);
			},

			removeCommand: function(commandName) {
				if (!this.hasCommand(commandName)) {
					return;
				}
				commands[commandName] = null;
				delete commands[commandName];
				this.removeInterceptor(commandName);
			},

			/**
			 *
			 * @param {Event} event
			 * @return {soma.core.controller.SequenceCommand}
			 */
			getSequencer: function(event) {
				var ss = sequencersInfo;
				for (var s  in ss) {
					var len = ss[s].length;
					for (var i = 0; i < len; i++) {
						if (ss[s][i] && ss[s][i].event.type === event.type) {
							var seq = sequencers[ ss[s][i].sequenceId ];
							return !!seq ? seq : null;
						}
					}
				}
				return null;
			},

			/**
			 *  Stops a sequence command using an event object that has been created from this sequence command.
			 * @param {Event} event
			 * @return Boolean
			 */
			stopSequencerWithEvent: function(event) {
				var ss = sequencersInfo;
				for (var s in ss) {
					var len = ss[s].length;
					for (var i = 0; i < len; i++) {
						if (ss[s][i].event.type === event.type) {
							try {
								sequencers[ ss[s][i].sequenceId ].stop();
							} catch(e) {
								return false;
							}
							return true;
						}
					}
				}
				return false;
			},

			/**
			 *
			 * @param {soma.core.controller.SequenceCommand} sequencer
			 */
			stopSequencer: function(sequencer) {
				if (sequencer == null) {
					return false;
				}
				sequencer.stop();
				return true;
			},

			/**
			 * @return void
			 */
			stopAllSequencers: function() {
				var ss = sequencers;
				var sis = sequencersInfo;
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

			/**
			 *
			 * @param {Event} event
			 */
			isPartOfASequence: function(event) {
				return ( this.getSequencer(event) != null );
			},

			/**
			 * @return Array array of running sequencers
			 */
			getRunningSequencers: function() {
				var a = [];
				var ss = sequencers;
				for (var s in ss) {
					a.push(ss[s]);
				}
				return a;
			},

			getLastSequencer: function() {
				return lastSequencer;
			},

			dispose: function() {
				for (var nameCommand in commands) {
					this.removeCommand(nameCommand);
				}
				for (var nameSequencer in sequencers) {
					sequencers[nameSequencer] = null;
					delete sequencers[nameSequencer];
				}
				commands = null;
				sequencers = null;
				lastEvent = null;
				lastSequencer = null;
			},

			// ================= LISTENERS ================

			/**
			 * @private
			 *
			 */
			domTreeHandler: function(e) {
				//d("domtreeHandler", e.eventPhase );
				if (e.bubbles && this.hasCommand(e.type) && !e.isCloned) {

					e.stopPropagation();
					var clonedEvent = e.clone();
					// store a reference of the events not to dispatch it twice
					// in case it is dispatched from the display list
					lastEvent = clonedEvent;
					this.instance.dispatchEvent(clonedEvent);
					if (!clonedEvent.isDefaultPrevented()) {
						this.executeCommand(e);
					}
					lastEvent = null;
				}
			},


			/**
			 * @private
			 */
			instanceHandler: function(e) {
				//d(e);
				if (e.bubbles && this.hasCommand(e.type)) {
					// if the event is equal to the lastEvent, this has already been dispatched for execution
					if (lastEvent != e) {
						if (!e.isDefaultPrevented()) {
							this.executeCommand(e);
						}
					}
				}
				lastEvent = null;
			}

		});
	})();


	soma.core.view.SomaViews = (function() {
		var views = null;
		return new Class({

			Implements: soma.IDisposable,
			autoBound:false,

			initialize:function() {
				views = {};
			},

			/**
			 *
			 * @param {String} viewName
			 * @return {Boolean}
			 */
			hasView: function(viewName) {
				return views[ viewName ] != null;
			},

			/**
			 *
			 * @param {String} viewName
			 * @param {soma.View} view
			 * @return {soma.View}
			 */
			addView: function(viewName, view) {
				if (this.hasView(viewName)) {
					throw new Error("View \"" + viewName + "\" already exists");
				}
				if (!this.autoBound) {
					soma.View.implement(AutoBindProto);
					this.autoBound = true;
				}
				if (view['shouldAutobind']) view.autobind();
				views[ viewName ] = view;
				if (view[ "init" ] != null) {
					view.init();
				}
				return view;
			},

			/**
			 *
			 * @param {String} viewName
			 * @return {soma.core.view.View}
			 */
			getView: function(viewName) {
				if (this.hasView(viewName)) {
					return views[ viewName ];
				}
				return null;
			},

			getViews: function() {
				var clone = {};
				for (var name in views) {
					clone[name] = views[name];
				}
				return clone;
			},

			removeView: function(viewName) {
				if (!this.hasView(viewName)) {
					return;
				}
				if (views[viewName]["dispose"] != null) {
					views[viewName].dispose();
				}
				views[ viewName ] = null;
				delete views[ viewName ];
			},

			dispose: function() {
				for (var name in views) {
					this.removeView(name);
				}
				views = null;
			}
		});
	})();

})();



/**
 * to save instantiation latency for singular class libraries, I recommend not building the Class Objects upopn
 * request, if they are not used in each page where they get loaded in.
 * This static method creates a class instance by either taking the class object or the Function, that
 * is base for the class object creation
 *
 * @param {Class | Function} clazz Mootools Class Object or Function
 * @param {Object} parameters that get passed to the constructor
 * @return Object
 */
soma.createClassInstance = function(clazz, parameters) {
	if (clazz.$constructor != Class) {
		clazz = new Class(new clazz());
	}
	if (arguments.length == 1) {
		return new clazz();
	}
	var a = [];
	for (var i = 1; i < arguments.length; i++) {
		a.push(arguments[i]);
	}
	return clazz.instantiate(a);
};

/**
 * EventDispatcher
 * @class EventDispatcher
 */
soma.EventDispatcher = (function() {
	var listeners = [];
	return new Class({
		initialize: function() {
			listeners = [];
		},
		addEventListener: function(type, listener, priority) {
			if (!listeners || !type || !listener) return;
			if (isNaN(priority)) priority = 0;
			listeners.push({type: type, listener: listener, priority: priority});
		},
		removeEventListener: function(type, listener) {
			if (!listeners || !type || !listener) return;
			var i = 0;
			var l = listeners.length;
			for (; i < l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type && eventObj.listener == listener) {
					listeners.splice(i, 1);
					return;
				}
			}
			return false;
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
				events[i].listener.apply(event.currentTarget, [event]);
			}
		},
		toString: function() {
			return "[Class soma.EventDispatcher]";
		},
		dispose: function() {
			listeners = null;
		}
	});
})();

soma.core.Application = new Class(
	/** @lends soma.core.Application.prototype */
	{
	Extends: soma.EventDispatcher,
	Implements: soma.IDisposable,
	/** Gets the document.body (DOM Element). */
	body:null,
	/** Gets the models manager instance (soma.core.model.SomaModel). */
	models:null,
	/** Gets the commands manager instance (soma.core.controller.SomaController). */
	controller:null,
	/** Gets the wires manager instance (soma.core.wire.SomaWire). */
	wires:null,
	/** Gets the views manager instance (soma.core.views.SomaViews). */
	views:null,

	/**
	 * @constructs
	 * @class Class that can be extended to create a framework instance and start the application.
	 * @description Creates a new Application and acts as the facade and main entry point of the application.
	 * @extends soma.EventDispatcher
	 * @example
var SomaApplication = new Class({
	Extends: soma.core.Application,
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
new SomaApplication();
	 */
	initialize:function() {
		this.body = document.body;
		if (!this.body) {
			throw new Error("SomaCore requires body of type Element");
		}
		this.controller = new soma.core.Controller(this);
		this.models = new soma.core.model.SomaModels(this);
		this.wires = new soma.core.wire.SomaWires(this);
		this.views = new soma.core.view.SomaViews();
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

	/**
	 * Indicates wether a wire has been registered to the framework.
	 * @param {string} wireName The name of the wire.
	 * @returns {boolean}
	 * @example
	 * this.hasWire("myWireName");
	 */
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

	getModels: function() {
		return (!this.models) ? null : this.models.getModels();
	},

	hasModel: function(modelName) {
		return (!this.models) ? false : this.models.hasModel(modelName);
	},

	getModel: function(modelName) {
		return (!this.models) ? null : this.models.getModel(modelName);
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

	registerModels: function() {
	},

	registerCommands: function() {
	},

	registerViews: function() {
	},

	registerWires: function() {
	},

	getSequencers: function() {
		return !!this.controller ? this.controller.getSequencers() : null;
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
		if (this.mediators) {
			this.mediators.dispose();
			this.mediators = null;
		}
		this.body = null;
	},

	init: function() {

	},

	start: function() {

	}
	
});


/*********************************************** # soma.model # ************************************************/
soma.core.model.SomaModels = (function() {
	var models = null;
	return new Class({

		Implements: soma.IDisposable,

		instance:null,

		initialize:function(instance) {
			this.instance = instance;
			models = {};
		},

		hasModel: function(modelName) {
			return models[ modelName ] != null;
		},

		/**
		 *
		 * @param {String} modelName
		 * @return {soma.core.model.Model}
		 */
		getModel: function(modelName) {
			if (this.hasModel(modelName)) {
				return models[ modelName ];
			}
			return null;
		},

		getModels: function() {
			var clone = {};
			var ms = models;
			for (var name in ms) {
				clone[name] = ms[name];
			}
			return clone;
		},

		addModel: function(modelName, model) {
			if (this.hasModel(modelName)) {
				throw new Error("Model \"" + modelName + "\" already exists");
			}
			models[ modelName ] = model;
			if (!model.dispatcher) model.dispatcher = this.instance;
			model.init();
			return model;
		},

		removeModel: function(modelName) {
			if (!this.hasModel(modelName)) {
				return;
			}
			models[ modelName ].dispose();
			models[ modelName ] = null;
			delete models[ modelName ];
		},

		dispose: function() {
			for (var name in this.models) {
				this.removeModel(name);
			}
			models = null;
		}
	});
})();

soma.core.model.Model = new Class({
	name: null,
	data: null,
	dispatcher:null,

	initialize: function(name, data, dispatcher) {
		this.data = data;
		this.dispatcher = dispatcher;
		if (name != null) {
			this.name = name;
		}
	}

	/**
	 * to be overridden
	 */
	,init: function() {

	}

	,dispose: function() {

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
	
	//___INSERT_SHARED_DOC___

});

/*********************************************** # soma.view # ************************************************/
soma.View = new Class({

	domElement: null,

	initialize: function(domElement) {
		var d;
		if( domElement != undefined ) {
			if( domElement instanceof Element ) {
				d = domElement;
			}else{
				throw Error( "domElement has to be a DOM-ELement");
			}
		}else{
			d = document.body;
		}
		this.domElement = d;
	},
	dispatchEvent: function(event) {
		this.domElement.dispatchEvent(event);
	},
	addEventListener: function() {
		this.domElement.addEventListener.apply(this.domElement, arguments);
	},
	removeEventListener: function() {
		this.domElement.removeEventListener.apply(this.domElement, arguments);
	}
});


/*********************************************** # soma.wire # ************************************************/
soma.core.wire.SomaWires = (function() {
	var wires = null;
	return new Class({

		Implements: soma.IDisposable,

		instance:null,

		initialize:function(instance) {
			this.instance = instance;
			wires = {};
		},

		/**
		 *
		 * @param {String} wireName
		 * @return {Boolean}
		 */
		hasWire: function(wireName) {
			return wires[ wireName ] != null;
		},

		/**
		 *
		 * @param {String} wireName
		 * @param {soma.core.wire.Wire} wire
		 * @return {soma.core.wire.Wire}
		 */
		addWire: function(wireName, wire) {
			if (this.hasWire(wireName)) {
				throw new Error("Wire \"" + wireName + "\" already exists");
			}
			if (wire['shouldAutobind']) wire.autobind();
			wires[ wireName ] = wire;
			wire.registerInstance(this.instance);
			wire.init();
			return wire;
		},

		/**
		 *
		 * @param {String} wireName
		 * @return {soma.core.wire.Wire}
		 */
		getWire: function(wireName) {
			if (this.hasWire(wireName)) {
				return wires[ wireName ];
			}
			return null;
		},

		getWires: function() {
			var clone = {};
			for (var name in wires) {
				clone[name] = wires[name];
			}
			return clone;
		},

		removeWire: function(wireName) {
			if (!this.hasWire(wireName)) {
				return;
			}
			wires[ wireName ].dispose();
			wires[ wireName ] = null;
			delete wires[ wireName ];
		},

		dispose: function() {
			for (var name in wires) {
				this.removeWire(name);
			}
			wires = null;
		}
	});
})();


/*********************************************** # soma.mediator # ************************************************/

soma.core.mediator.Mediator = new Class({

	Extends: soma.core.wire.Wire,
	Implements: soma.IDisposable,

	viewComponent: null,

	initialize: function(viewComponent) {
		this.viewComponent = viewComponent;
		this.parent();
	},

	dispose: function() {
		this.viewComponent = null;
		this.parent();
	}
	
	//___INSERT_SHARED_DOC___
});

/*********************************************** # event # ************************************************/

soma.Event = new Class({
	initialize: function(type, data, bubbles, cancelable) {
		var e = document.createEvent("Event");
		e.initEvent(type, bubbles !== undefined ? bubbles : true, cancelable !== undefined ? cancelable : false);
		e.cancelable = cancelable !== undefined ? cancelable : false;
		if (data) {
			for (var k in data) {
				e[k] = data[k];
			}
			e.data = data;
		}
		e.clone = this.clone.bind(e);
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	},
	clone: function() {
		var e = document.createEvent("Event");
		e.initEvent(this.type, this.bubbles, this.cancelable);
		var d = this.data;
		for (var k in d) {
			e[k] = d[k];
		}
		e.data = d;
		e.isCloned = true;
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	},
	isDefaultPrevented: function() {
		if (this.getDefaultPrevented) {
			return this.getDefaultPrevented();
		} else {
			return this.defaultPrevented;
		}
	}
});

soma.core.IResponder = new Class({
	fault: function(info) {
	},
	result: function(data) {
	}
});

soma.core.IDisposable = new Class({
	dispose: function() {
	}
});
