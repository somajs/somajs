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
	 * @function
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

	/**
	 * @private
	 */
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

	/**
	 * 
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
	 * @borrows soma.core.Application#getWires
	 * @borrows soma.core.Application#hasWire
	 * @borrows soma.core.Application#removeWire
	 * @borrows soma.core.Application#addModel
	 * @borrows soma.core.Application#getModel
	 * @borrows soma.core.Application#getModels
	 * @borrows soma.core.Application#hasModel
	 * @borrows soma.core.Application#removeModel
	 * @borrows soma.core.Application#addView
	 * @borrows soma.core.Application#getView
	 * @borrows soma.core.Application#getViews
	 * @borrows soma.core.Application#hasView
	 * @borrows soma.core.Application#removeView
	 * @borrows soma.core.Application#addCommand
	 * @borrows soma.core.Application#getCommand
	 * @borrows soma.core.Application#getCommands
	 * @borrows soma.core.Application#hasCommand
	 * @borrows soma.core.Application#removeCommand
	 * @borrows soma.core.Application#getSequencer
	 * @borrows soma.core.Application#stopSequencerWithEvent
	 * @borrows soma.core.Application#stopSequencer
	 * @borrows soma.core.Application#stopAllSequencers
	 * @borrows soma.core.Application#isPartOfASequence
	 * @borrows soma.core.Application#getLastSequencer
	 * @borrows soma.core.Application#getRunningSequencers
	 * @borrows soma.EventDispatcher#addEventListener
	 * @borrows soma.EventDispatcher#removeEventListener
	 * @borrows soma.EventDispatcher#hasEventListener
	 * @borrows soma.EventDispatcher#dispatchEvent
	 * @example
	 * this.addCommand("eventType", MyCommand);
	 * @example
var MyCommand = new Class({
	Extends:soma.core.controller.Command,
	execute: function(event) {
		// access framework elements examples:
		// alert(this.instance)
		// alert(getWire("myWireName"))
		// addModel("myModelName", new Model());
	}
});
	 */
	soma.core.controller.Command = new Class(
		/** @lends soma.core.controller.Command.prototype */
		{
		Implements: SomaSharedCore,

		instance: null,

		registerInstance: function(instance) {
			this.instance = instance;
		},

		/**
		 * Method called by the framework when the command is executed by the framework. All the framework elements are accessible in this method (wires, commands, models, views, instance of the framework and body).
		 * @param {soma.Event} event The event dispatched to triggered the command.
		 * @example
var MyCommand = new Class({
 	Extends:soma.core.controller.Command,
	execute: function(event) {
		// alert(event.type)
	}
});
		 */
		execute: function(event) {
			
		}

	});

	var SequenceCommandProxy = new Class({
		event:null,
		sequenceId:null,
		initialize: function(event) {
			this.event = event;
		}
	});

	soma.core.controller.SequenceCommand = new Class(
		/** @lends soma.core.controller.SequenceCommand.prototype */
		{
		Extends: soma.core.controller.Command,
		Implements: SomaSharedCore,
		/** {array} List of commands */
		commands: null,
		/** {soma.Event} The current command in progress. */
		currentCommand: null,
		/** {string} The id of the sequence. */
		id:null,
		
		/**
		 * @constructs
		 * @class The SequenceCommand class is used to execute a list of commands one after the other. The commands added can be asynchronous or synchronous.
		 * @description Creates a new SequenceCommand, should be instantiated by the framework only.
		 * @param {string} id The id of the sequence.
		 * @extends soma.core.controller.Command
		 * @borrows soma.core.controller.Command#execute
		 * @borrows soma.core.Application#addWire
		 * @borrows soma.core.Application#getWire
		 * @borrows soma.core.Application#getWires
		 * @borrows soma.core.Application#hasWire
		 * @borrows soma.core.Application#removeWire
		 * @borrows soma.core.Application#addModel
		 * @borrows soma.core.Application#getModel
		 * @borrows soma.core.Application#getModels
		 * @borrows soma.core.Application#hasModel
		 * @borrows soma.core.Application#removeModel
		 * @borrows soma.core.Application#addView
		 * @borrows soma.core.Application#getView
		 * @borrows soma.core.Application#getViews
		 * @borrows soma.core.Application#hasView
		 * @borrows soma.core.Application#removeView
		 * @borrows soma.core.Application#addCommand
		 * @borrows soma.core.Application#getCommand
		 * @borrows soma.core.Application#getCommands
		 * @borrows soma.core.Application#hasCommand
		 * @borrows soma.core.Application#removeCommand
		 * @borrows soma.core.Application#getSequencer
		 * @borrows soma.core.Application#stopSequencerWithEvent
		 * @borrows soma.core.Application#stopSequencer
		 * @borrows soma.core.Application#stopAllSequencers
		 * @borrows soma.core.Application#isPartOfASequence
		 * @borrows soma.core.Application#getLastSequencer
		 * @borrows soma.core.Application#getRunningSequencers
		 * @borrows soma.EventDispatcher#addEventListener
		 * @borrows soma.EventDispatcher#removeEventListener
		 * @borrows soma.EventDispatcher#hasEventListener
		 * @borrows soma.EventDispatcher#dispatchEvent
		 * @example
this.addCommand("doSomethingAsync", CommandASyncExample);
this.addCommand("doSomethingElseAsync", CommandASyncExample);
this.addCommand("doSomething", CommandExample);
		 * @example
this.addCommand("excuteMySequence", SequenceCommandExample);
this.dispatchEvent(new MyEvent("excuteMysequence"));
		 * @example
var SequenceTestCommand = new Class ({
	Extends: soma.core.controller.SequenceCommand,

	initialize: function() {
		this.parent("sequencer.test.id");
	},

	initializeSubCommands: function() {

		 this.addSubCommand(new soma.Event("doSomethingAsync"));
		 this.addSubCommand(new soma.Event("doSomethingElseAsync"));
		 this.addSubCommand(new soma.Event("doSomething"));

	}

});
		 * @example
var CommandExample = new Class {{
	   Extends: soma.core.controller.Command,

	execute: function(event) {
		// do something
		if(this.isPartOfASequence(event)) {
			// execute the next command
			this.getSequencer(event).executeNextCommand();
		}
	}
});
		 */
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
		 * Method that you can overwrite to add commands to the sequence command.
		 * @example
var SequenceTestCommand = new Class ({
	Extends: soma.core.controller.SequenceCommand,

	initialize: function() {
		this.parent("sequencer.test.id");
	},

	initializeSubCommands: function() {

		 this.addSubCommand(new soma.Event("doSomethingAsync"));
		 this.addSubCommand(new soma.Event("doSomethingElseAsync"));
		 this.addSubCommand(new soma.Event("doSomething"));

	}

});
		 */
		initializeSubCommands: function() {
			throw new Error("Subclasses of SequenceCommand must implement initializeSubCommands()");
		},
		/**
		 * Add a command to the list of commands to execute one after the other.
		 * @param {soma.Event} event The event that will trigger a command.
		 * @example
this.addSubCommand(new soma.Event("eventType"));
		 */
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

		/**
		 * Method used to execute the next command in the list of subcommands. If a command is part of a sequence, you must call the executeNextCommand in the command itself.
		 * @example
var CommandExample = new Class {{
	   Extends: soma.core.controller.Command,

	execute: function(event) {
		// do something
		if(this.isPartOfASequence(event)) {
			// execute the next command
			this.getSequencer(event).executeNextCommand();
		}
	}
});
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
		 * Gets the numbers of commands to be executed.
		 * @return {int}
		 */
		getLength: function() {
			if (this.commands == null) {
				return -1;
			}
			return this.commands.length;
		},

		/**
		 * Stops the current sequence.
		 * @return Boolean
		 */
		stop: function() {
			this.commands = null;
			this.commands = null;
			this.currentCommand = null;
			return this.instance.controller.unregisterSequencer(this);
		},

		/**
		 * Returns the current command in progress.
		 * @return {soma.core.controller.SequenceCommand}
		 */
		getCurrentCommand: function() {
			return this.currentCommand;
		},

		/**
		 * Gets the list of commands to be executed.
		 * @return {array} An array of commands.
		 */
		getCommands: function() {
			return this.commands;
		}

	});

	soma.core.controller.ParallelCommand = new Class(
		/** @lends soma.core.controller.ParallelCommand.prototype */
		{
		Extends: soma.core.controller.Command,
		Implements: SomaSharedCore,
		/** List of commands to be executed. */
		commands:null,

		/**
		 * @constructs
		 * @class The ParallelCommand class is used to execute a list of commands, they will all start at the same time.
		 * @description Creates a new ParallelCommand, should be instantiated by the framework only.
		 * @extends soma.core.controller.Command
		 * @borrows soma.core.controller.Command#execute
		 * @borrows soma.core.Application#addWire
		 * @borrows soma.core.Application#getWire
		 * @borrows soma.core.Application#getWires
		 * @borrows soma.core.Application#hasWire
		 * @borrows soma.core.Application#removeWire
		 * @borrows soma.core.Application#addModel
		 * @borrows soma.core.Application#getModel
		 * @borrows soma.core.Application#getModels
		 * @borrows soma.core.Application#hasModel
		 * @borrows soma.core.Application#removeModel
		 * @borrows soma.core.Application#addView
		 * @borrows soma.core.Application#getView
		 * @borrows soma.core.Application#getViews
		 * @borrows soma.core.Application#hasView
		 * @borrows soma.core.Application#removeView
		 * @borrows soma.core.Application#addCommand
		 * @borrows soma.core.Application#getCommand
		 * @borrows soma.core.Application#getCommands
		 * @borrows soma.core.Application#hasCommand
		 * @borrows soma.core.Application#removeCommand
		 * @borrows soma.core.Application#getSequencer
		 * @borrows soma.core.Application#stopSequencerWithEvent
		 * @borrows soma.core.Application#stopSequencer
		 * @borrows soma.core.Application#stopAllSequencers
		 * @borrows soma.core.Application#isPartOfASequence
		 * @borrows soma.core.Application#getLastSequencer
		 * @borrows soma.core.Application#getRunningSequencers
		 * @borrows soma.EventDispatcher#addEventListener
		 * @borrows soma.EventDispatcher#removeEventListener
		 * @borrows soma.EventDispatcher#hasEventListener
		 * @borrows soma.EventDispatcher#dispatchEvent
		 * @example
this.addCommand("doSomethingAsync", CommandASyncExample);
this.addCommand("doSomethingElseAsync", CommandASyncExample);
this.addCommand("doSomething", CommandExample);
		 * @example
this.addCommand("excuteMyCommands", ParallelCommandExample);
this.dispatchEvent(new MyEvent("excuteMyCommands"));
		 * @example
var ParallelTestCommand = new Class({
	Extends: soma.core.controller.ParallelCommand,

	initializeSubCommands: function(){
		this.addSubCommand(new soma.Event("doSomethingAsync"));
		this.addSubCommand(new soma.Event("doSomethingElseAsync"));
		this.addSubCommand(new soma.Event("doSomething"));
	}
});
		 */
		initialize: function() {
			this.commands = [];
		},
		registerInstance: function(instance) {
			this.instance = instance;
			this.initializeSubCommands();
		},
		/**
		 * Method that you can overwrite to add commands to the parallel command.
		 * @example
var ParallelTestCommand = new Class({
	Extends: soma.core.controller.ParallelCommand,

	initializeSubCommands: function(){
		this.addSubCommand(new soma.Event("doSomethingAsync"));
		this.addSubCommand(new soma.Event("doSomethingElseAsync"));
		this.addSubCommand(new soma.Event("doSomething"));
	}
});
		 */
		initializeSubCommands: function() {
			throw new Error("Subclasses of ParallelCommand must implement initializeSubCommands()");
		},
		/**
		 * Add a command to the list of commands to execute in parallel.
		 * @param {soma.Event} event The event that will trigger a command.
		 * @example
this.addSubCommand(new soma.Event("eventType"));
		 */
		addSubCommand: function(e) {
			this.commands.push(e);
		},

		/**
		 * Should not be overriden in a parallel class.
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
		 * Gets the numbers of commands to be executed.
		 * @return {int}
		 */
		getLength: function() {
			return this.commands != null ? this.commands.length : -1;
		},

		/**
		 * Gets the list of commands to be executed.
		 * @return {array} An array of commands.
		 */
		getCommands: function() {
			return this.commands;
		}
		
	});

	soma.core.wire.Wire = new Class(
		/** @lends soma.core.wire.Wire.prototype */
		{
		Implements: [SomaSharedCore, soma.core.AutoBind],
		/** {string} The name of the wire */
		name: null,
		instance: null,

		/**
		 * @constructs
		 * @class
		 * A Wire is a class that will hold the logic of the Application.
		 * Wires can be used in many ways, depending on how you want to manage your views, commands and models. A wire can be used as a manager and handle many models, views or other wires. A wire can also be used in a one-to-one way (as a proxy), a single wire that handles a single view, a single wire that handles a single model, and so on.
		 * Wires can be flexible or rigid depending on how your build your application.
		 * A wire has access to everything in the framework: you can create views, add and dispatch commands, create models, access to the framework instance, access to the stage, and so on.
		 * A wire can also be in control of the commands that are dispatched by listening to them and even stop their execution if needed (see the examples in this page).
		 * @description Create an instance of a Wire class.
		 * @borrows soma.core.Application#addWire
		 * @borrows soma.core.Application#getWire
		 * @borrows soma.core.Application#getWires
		 * @borrows soma.core.Application#hasWire
		 * @borrows soma.core.Application#removeWire
		 * @borrows soma.core.Application#addModel
		 * @borrows soma.core.Application#getModel
		 * @borrows soma.core.Application#getModels
		 * @borrows soma.core.Application#hasModel
		 * @borrows soma.core.Application#removeModel
		 * @borrows soma.core.Application#addView
		 * @borrows soma.core.Application#getView
		 * @borrows soma.core.Application#getViews
		 * @borrows soma.core.Application#hasView
		 * @borrows soma.core.Application#removeView
		 * @borrows soma.core.Application#addCommand
		 * @borrows soma.core.Application#getCommand
		 * @borrows soma.core.Application#getCommands
		 * @borrows soma.core.Application#hasCommand
		 * @borrows soma.core.Application#removeCommand
		 * @borrows soma.core.Application#getSequencer
		 * @borrows soma.core.Application#stopSequencerWithEvent
		 * @borrows soma.core.Application#stopSequencer
		 * @borrows soma.core.Application#stopAllSequencers
		 * @borrows soma.core.Application#isPartOfASequence
		 * @borrows soma.core.Application#getLastSequencer
		 * @borrows soma.core.Application#getRunningSequencers
		 * @borrows soma.EventDispatcher#addEventListener
		 * @borrows soma.EventDispatcher#removeEventListener
		 * @borrows soma.EventDispatcher#hasEventListener
		 * @borrows soma.EventDispatcher#dispatchEvent
		 * @example
var MyWire = new Class({
	Extends: soma.core.wire.Wire,

	init: function() {
		// starting point
	},

	dispose: function() {
		// called when the wire is removed from the framework
	}
});
MyWire.NAME = "Wire::MyWire";
		 */
		initialize: function(name) {
			if (name != null) {
				this.name = name;
			}
		},
		
		registerInstance: function(instance) {
			this.instance = instance;
		},

		/**
		 * Method that can you can override, called when the wire has been registered to the framework.
		 */
		init: function() {

		},

		/**
		 * Method that can you can override, called when the wire has been removed from the framework.
		 */
		dispose: function() {

		},

		/**
		 * Retrieves the name of the wire.
		 * @returns {string} The name of the wire.
		 */
		getName: function() {
			return this.name;
		},

		/**
		 * Sets the name of the wire.
		 * @param {string} The name of the wire.
		 */
		setName: function(name) {
			this.name = name;
		}
		
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
 * @name soma.EventDispatcher
 * @class asdsdf
 * @namespace Class on which on you can add and remove listeners of an event. A event can be dispatched from it and a notification will be sent to all registered listeners.
 * @example
var dispatcher = new soma.EventDispatcher();

dispatcher.addEventListener("eventType", eventHandler);

function eventHandler(event) {
	 // alert(event.type);
}

dispatcher.dispatchEvent(new soma.Event("eventType"));
 */
soma.EventDispatcher = (function() {
	/** @lends soma.EventDispatcher.prototype */
	var listeners = [];
	return new Class({
		initialize: function() {
			listeners = [];
		},
		/**
		 * Registers an event listener with an EventDispatcher object so that the listener receives notification of an event.
		 * @param {string} type The type of event.
		 * @param {function} listener The listener function that processes the event. This function must accept an Event object as its only parameter and must return nothing.
		 * @param {int} priority The priority level of the event listener (default 0). The higher the number, the higher the priority (can take negative number).
		 * @example
dispatcher.addEventListener("eventType", eventHandler);
function eventHandler(event) {
	// alert(event.type)
}
		 */
		addEventListener: function(type, listener, priority) {
			if (!listeners || !type || !listener) return;
			if (isNaN(priority)) priority = 0;
			listeners.push({type: type, listener: listener, priority: priority});
		},
		/**
		 * Removes a listener from the EventDispatcher object. If there is no matching listener registered with the EventDispatcher object, a call to this method has no effect.
		 * @param {string} type The type of event.
		 * @param {function} listener The listener object to remove.
		 * @example
dispatcher.removeEventListener("eventType", eventHandler);
		 */
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
		/**
		 * Checks whether the EventDispatcher object has any listeners registered for a specific type of event.
		 * @param {string} type The type of event.
		 * @return {boolean}
		 * @example
dispatcher.hasEventListener("eventType");
		 */
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
		/**
		 * Dispatches an event into the event flow. The event target is the EventDispatcher object upon which the dispatchEvent() method is called.
		 * @param {soma.Event} event The Event object that is dispatched into the event flow. If the event is being redispatched, a clone of the event is created automatically.
		 * @example
dispatcher.dispatchEvent(new soma.Event("eventType"));
		 */
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
		/**
		 * Destroy the elements of the instance. The instance still needs to be nullified.
		 * @example
instance.dispose();
instance = null;
		 */
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
	 * @borrows soma.EventDispatcher#addEventListener
	 * @borrows soma.EventDispatcher#removeEventListener
	 * @borrows soma.EventDispatcher#hasEventListener
	 * @borrows soma.EventDispatcher#dispatchEvent
	 * @borrows soma.EventDispatcher#dispose
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

	/**
	 * Indicates whether a command has been registered to the framework.
	 * @param {string} commandName Event type that is used as a command name.
	 * @returns {boolean}
	 * @example
	 * this.hasCommand("eventType");
	 */
	hasCommand: function(commandName) {
		return (!this.controller) ? false : this.controller.hasCommand(commandName);
	},

	/**
	 * Retrieves the command class that has been registered with a command name.
	 * @param {string} commandName Event type that is used as a command name.
	 * @returns {class} A command Class.
	 * @example
	 * var commandClass = this.getCommand("eventType");
	 */
	getCommand: function(commandName) {
		return (!this.controller) ? null : this.controller.getCommand(commandName);
	},

	/**
	 * Retrieves all the command names (event type) that have been registered to the framework.
	 * @returns {array} An array of command names (string).
	 * @example
	 * var commands = this.getCommands();
	 */
	getCommands: function() {
		return (!this.controller) ? null : this.controller.getCommands();
	},

	/**
	 * Registers a command to the framework.
	 * @param {string} commandName Event type that is used as a command name.
	 * @param {class} command Class that will be executed when a command has been dispatched.
	 * @example
	 * this.addCommand("eventType", MyCommand);
	 */
	addCommand: function(commandName, command) {
		this.controller.addCommand(commandName, command);
	},

	/**
	 * Removes a command from the framework.
	 * @param {string} commandName Event type that is used as a command name.
	 * @example
	 * this.removeCommand("eventType");
	 */
	removeCommand: function(commandName) {
		this.controller.removeCommand(commandName);
	},

	/**
	 * Indicates whether a wire has been registered to the framework.
	 * @param {string} wireName The name of the wire.
	 * @returns {boolean}
	 * @example
	 * this.hasWire("myWireName");
	 */
	hasWire: function(wireName) {
		return (!this.wires) ? false : this.wires.hasWire(wireName);
	},

	/**
	 * Retrieves the wire instance that has been registered using its name.
	 * @param {string} wireName The name of the wire.
	 * @returns {soma.core.wire.Wire} A wire instance.
	 * @example
	 * var myWire = this.getWire("myWireName");
	 */
	getWire: function(wireName) {
		return (!this.wires) ? null : this.wires.getWire(wireName);
	},

	/**
	 * Retrieves an array of the registered wires.
	 * @returns {array} An array of wires.
	 * @example
	 * var wires = this.getWires();
	 */
	getWires: function() {
		return (!this.wires) ? null : this.wires.getWires();
	},

	/**
	 * Registers a wire to the framework.
	 * @param {string} wireName The name of the wire.
	 * @param {soma.core.wire.Wire} wire A wire instance.
	 * @returns {soma.core.wire.Wire} The wire instance.
	 * @example
	 * this.addWire("myWireName", new MyWire());
	 */
	addWire: function(wireName, wire) {
		return this.wires.addWire(wireName, wire);
	},

	/**
	 * Removes a wire from the framework and calls the dispose method of this wire.
	 * @param {string} wireName The name of the wire.
	 * @example
	 * this.removeWire("myWireName");
	 */
	removeWire: function(wireName) {
		this.wires.removeWire(wireName);
	},

	/**
	 * Indicates whether a model has been registered to the framework.
	 * @param {string} modelName The name of the model.
	 * @returns {boolean}
	 * @example
	 * this.hasModel("myModelName");
	 */
	hasModel: function(modelName) {
		return (!this.models) ? false : this.models.hasModel(modelName);
	},

	/**
	 * Retrieves the model instance that has been registered using its name.
	 * @param {string} modelName The name of the model.
	 * @returns {soma.core.model.Model} A model instance.
	 * @example
	 * var myModel = this.getModel("myModelName");
	 */
	getModel: function(modelName) {
		return (!this.models) ? null : this.models.getModel(modelName);
	},

	/**
	 * Retrieves an array of the registered models.
	 * @returns {array} An array of models.
	 * @example
	 * var models = this.getModels();
	 */
	getModels: function() {
		return (!this.models) ? null : this.models.getModels();
	},

	/**
	 * Registers a model to the framework.
	 * @param {string} modelName The name of the model.
	 * @param {soma.core.model.Model} model A model instance.
	 * @returns {soma.core.model.Model} The model instance.
	 * @example
	 * this.addModel("myModelName", new MyModel());
	 */
	addModel: function(modelName, model) {
		return this.models.addModel(modelName, model);
	},

	/**
	 * Removes a model from the framework and call the dispose method of this model.
	 * @param {string} modelName The name of the model.
	 * @example
	 * this.removeModel("myModelName");
	 */
	removeModel: function(modelName) {
		this.models.removeModel(modelName);
	},

	/**
	 * Indicates whether a view has been registered to the framework.
	 * @param {string} viewName The name of the view.
	 * @returns {boolean}
	 * @example
	 * this.hasView("myViewName");
	 */
	hasView: function(viewName) {
		return (!this.views) ? false : this.views.hasView(viewName);
	},

	/**
	 * Retrieves the view instance that has been registered using its name.
	 * @param {string} viewName The name of the view.
	 * @returns {soma.View or custom class} A view instance.
	 * @example
	 * var myView = this.getView("myViewName");
	 */
	getView: function(viewName) {
		return (!this.views) ? null : this.views.getView(viewName);
	},

	/**
	 * Retrieves an array of the registered views.
	 * @returns {array} An array of views.
	 * @example
	 * var views = this.getViews();
	 */
	getViews: function() {
		return (!this.views) ? null : this.views.getViews();
	},

	/**
	 * Registers a view to the framework.
	 * @param {string} viewName The name of the view.
	 * @param {soma.View or custom class} view A view instance.
	 * @returns {soma.View or custom class} The view instance.
	 * @example
	 * this.addView("myViewName", new MyView());
	 */
	addView: function(viewName, view) {
		return this.views.addView(viewName, view);
	},

	/**
	 * Removes a view from the framework and call the (optional) dispose method of this view.
	 * @param {string} viewName The name of the view.
	 * @example
	 * this.removeView("myViewName");
	 */
	removeView: function(viewName) {
		this.views.removeView(viewName);
	},

	/**
	 * Retrieves the sequence command instance using an event instance that has been created from this sequence command.
	 * @param {soma.Event} event Event instance.
	 * @returns {soma.core.controller.SequenceCommand} A sequence command.
	 * @example
	 * var sequencer = this.getSequencer(myEvent);
	 */
	getSequencer: function(event) {
		return !!this.controller ? this.controller.getSequencer(event) : null;
	},

	/**
	 * Indicates whether an event has been instantiated from a ISequenceCommand class.
	 * @param {soma.Event} event Event instance.
	 * @returns {boolean}
	 * @example
	 * var inSequence = this.isPartOfASequence(myEvent);
	 */
	isPartOfASequence: function(event) {
		return ( this.getSequencer(event) != null );
	},

	/**
	 * Stops a sequence command using an event instance that has been created from this sequence command.
	 * @param {soma.Event} event Event instance.
	 * @returns {boolean}
	 * @example
	 * var success = this.stopSequencerWithEvent(myEvent);
	 */
	stopSequencerWithEvent: function(event) {
		return !!this.controller ? this.controller.stopSequencerWithEvent(event) : false;
	},

	/**
	 * Stops a sequence command using the sequence command instance itself.
	 * @param {soma.core.controller.SequenceCommand} sequencer A sequence command.
	 * @returns {boolean}
	 * @example
	 * var success = this.stopSequencer(mySequenceCommand);
	 */
	stopSequencer: function(sequencer) {
		return !!this.controller ? this.controller.stopSequencer(sequencer) : false;
	},

	/**
	 * Stops all the sequence command instances that are running.
	 * @example
	 * this.stopAllSequencers();
	 */
	stopAllSequencers: function() {
		if (this.controller) {
			this.controller.stopAllSequencers();
		}
	},

	/**
	 * Retrieves all the sequence command instances that are running.
	 * @returns {array} An array of sequence commands.
	 * @example
	 * var sequencers = this.getRunningSequencers();
	 */
	getRunningSequencers: function() {
		return !!this.controller ? this.controller.getRunningSequencers() : null;
	},

	/**
	 * Retrieves the last sequence command that has been instantiated in the framework.
	 * @returns {soma.core.controller.SequenceCommand} A sequence command.
	 * @example
	 * var lastSequencer = this.getLastSequencer();
	 */
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

	/** Method that you can optionally overwrite to initialize elements before anything else, this method is the first one called after that the framework is ready (init > registerModels > registerViews > registerCommands > registerWires > start). */
	init: function() {

	},

	/** Method that you can optionally overwrite to register models to the framework (init > registerModels > registerViews > registerCommands > registerWires > start). */
	registerModels: function() {
	},

	/** Method that you can optionally overwrite to register views to the framework (init > registerModels > registerViews > registerCommands > registerWires > start). */
	registerViews: function() {
	},

	/** Method that you can optionally overwrite to register commands (mapping events to command classes) to the framework (init > registerModels > registerViews > registerCommands > registerWires > start). */
	registerCommands: function() {
	},

	/** Method that you can optionally overwrite to register wires to the framework (init > registerModels > registerViews > registerCommands > registerWires > start). */
	registerWires: function() {
	},

	/** Method that you can optionally overwrite, this method is the last one called by the framework and comes after all the registration methods (init > registerModels > registerViews > registerCommands > registerWires > start). */
	start: function() {

	}
	
});

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
	
});

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
	
});

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
