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

	var AutoBindProto = {
		/** @private */
		blackList: ["initialize", "parent", "$constructor", "addEventListener", "removeEventListener" ]
		/**
		 * AutoBind the object.
		 * @name autobind
		 * @methodOf soma.core.AutoBind#
		 * @example
MyAutoBoundClass = new Class({
	Implements: soma.core.AutoBind,
	initialize: function() {
		this.autobind();
	}
 });

		 */
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
		/** @private */
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
	/**
	 * @class
	 * Provides the functionality to autobind with implicit need to keep object scope like event listeners and handlers/callbacks ending with *Listener or *Handler.
	 * Wires and Mediators are implementing instance scope autobinding upon registration.
	 * @description Creates a new AutoBind class.
	 * @example
// wire not autobound
var MyWire = new Class({
	Extends: soma.core.wire.Wire,
	init: function() {
		this.addEventListener("eventType", this.eventHandler.bind(this));
	},
	eventHandler: function(event) {
		// "this" keyword is this wire.
	}
});

// wire autobound
var MyWire = new Class({
	Extends: soma.core.wire.Wire,
	shouldAutobind: true,
	init: function() {
		this.addEventListener("eventType", this.eventHandler);
	},
	eventHandler: function(event) {
		// "this" keyword is this wire.
	}
});
	 */
	soma.core.AutoBind = new Class(
		/** @lends soma.core.AutoBind.prototype */
		AutoBindProto);

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
// register and dispatch a command
this.addCommand("myEventType", MyCommand);
this.dispatchEvent(new soma.Event("myEventType"));
	 * @example
// create a command class
var MyCommand = new Class({
	Extends:soma.core.controller.Command,
	execute: function(event) {
		// access framework elements examples:
		// alert(this.instance)
		// alert(this.getWire("myWireName"))
		// this.addModel("myModelName", new Model());
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
		 * A Wire is a class that will hold the logic of the Application.<br/>
		 * Wires can be used in many ways, depending on how you want to manage your views, commands and models. A wire can be used as a manager and handle many models, views or other wires. A wire can also be used in a one-to-one way (as a proxy), a single wire that handles a single view, a single wire that handles a single model, and so on.<br/>
		 * Wires can be flexible or rigid depending on how your build your application.<br/>
		 * A wire has access to everything in the framework: you can create views, add and dispatch commands, create models, access to the framework instance, access to the stage, and so on.<br/>
		 * A wire can also be in control of the commands that are dispatched by listening to them and even stop their execution if needed (see the examples in this page).<br/>
		 * @description Create an instance of a Wire class.
		 * @param {string} name The name of the wire.
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
// add a wire to the framework
this.addWire("myWireName", new MyWire());
		 * @example
// remove a wire from the framework
this.removeWire("myWireName");
		 * @example
// retrieve a wire
var wire = this.getWire("myWireName");
		 * @example
// create a wire
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
		 * @example
// listening to a command in a wire.
var MyWire = new Class({
	Extends: soma.core.wire.Wire,

	init: function() {
		this.addEventListener("eventType", eventHandler);
	},

	eventHandler: function(event) {
		
	}
});
MyWire.NAME = "Wire::MyWire";
		 * @example
// Stopping the execution of a command in a wire.
// The cancelable property of the event need to be set to true when you dispatch it.
// Any command can be stopped using the native event built-in method: preventDefault.
var MyWire = new Class({
	Extends: soma.core.wire.Wire,

	init: function() {
		this.addEventListener("eventType", eventHandler);
	},

	eventHandler: function(event) {
		// stops the execution of the command
		event.preventDefault();
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

	/**
	 * @name soma.core.controller.SomaController
	 * @namespace
	 * The SomaController handles the commands added to the framework and the events dispatched from either a display list or a framework element (instance of the framework, commands or wires).<br/>
	 * All the events dispatched with a property bubbles set to false will be ignored, that is why the event mapped to a command class must have this property set to true.<br/>
	 * You can add commands, remove commands and dispatch commands from: the framework instance, the stage, a view, a wire, a command or a model.<br/>
	 * You can create 4 types of commands: synchronous (Command), asynchronous, parallel (ParallelCommand) and sequence (SequenceCommand). See each class for a detailed explanation and examples.<br/>
	 * You can use the properties of a custom event to send parameters and receive them in the commands.<br/>
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
	 * @example
addCommand("eventType", CommandExample);
dispatchEvent(new soma.Event("eventType"));
removeCommand("eventType");
	 */
	soma.core.controller.SomaController = (function() {
		/** @lends soma.core.controller.SomaController.prototype */
		
		var boundInstance = null;
		var boundDomtree = null;
		var commands = null;
		var sequencers = null;
		var sequencersInfo = null;
		var lastEvent = null;
		var lastSequencer = null;

		return new Class({
			Implements: soma.core.IDisposable,
			
			instance:null,

			initialize:function(instance) {
				this.instance = instance;
				commands = {};
				sequencersInfo = {};
				sequencers = {};
				boundInstance = this.instanceHandler.bind(this);
				boundDomtree = this.domTreeHandler.bind(this);
			},

			/** @private */
			addInterceptor: function(commandName) {
				if (!soma["core"]) {
					throw new Error("soma package has been overwritten by local variable");
				}

				// handle events dispatched from the domTree
				if (this.instance.body.addEventListener) {
					this.instance.body.addEventListener(commandName, boundDomtree, true);
				}

				// handle events dispatched from the Soma facade
				this.instance.addEventListener(commandName, boundInstance, Number.NEGATIVE_INFINITY);

			},

			/** @private */
			removeInterceptor: function(commandName) {
				if (this.instance.body.removeEventListener) {
					this.instance.body.removeEventListener(commandName, boundDomtree, true);
				}
				this.instance.removeEventListener(commandName, boundInstance);
			},

			/** @private */
			executeCommand: function(e) {
				var commandName = e.type;
				if (this.hasCommand(commandName)) {
					var command = soma.createClassInstance(commands[ commandName ]);
					command.registerInstance(this.instance);
					command.execute(e);
				}
			},

			/** @private */
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

			/** @private */
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

			/** @private */
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

			stopSequencer: function(sequencer) {
				if (sequencer == null) {
					return false;
				}
				sequencer.stop();
				return true;
			},

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

			isPartOfASequence: function(event) {
				return ( this.getSequencer(event) != null );
			},

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

			/** @private */
			domTreeHandler: function(e) {
				if (e.bubbles && this.hasCommand(e.type) && !e.isCloned) {
					if( e.stopPropagation ) {
                        e.stopPropagation();
                    }else{
                        e.cancelBubble = true;
                    }
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

			/** @private */
			instanceHandler: function(e) {
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

	/**
	 * @name soma.core.view.SomaViews
	 * @namespace The SomaViews class handles the views of the application.
	 * @borrows soma.core.Application#addView
	 * @borrows soma.core.Application#getView
	 * @borrows soma.core.Application#getViews
	 * @borrows soma.core.Application#hasView
	 * @borrows soma.core.Application#removeView
	 * @example
this.addView("myViewName", new MyView());
this.removeView("myViewName");
var view = this.getView("myViewName");
	 */
	soma.core.view.SomaViews = (function() {
		/** @lends soma.core.view.SomaViews.prototype */

		var views = null;

		return new Class({

			Implements: soma.core.IDisposable,

			autoBound:false,

            /**
             * {SomaApplication}
             */
            instance:null,

            /**
             *
             * @param {SomaApplication} instance
             */
			initialize:function( instance ) {
				views = {};
                this.instance = instance;
			},

			hasView: function(viewName) {
				return views[ viewName ] != null;
			},

			addView: function(viewName, view) {
				if (this.hasView(viewName)) {
					throw new Error("View \"" + viewName + "\" already exists");
				}

				if (document.attachEvent) {
					view.instance = this.instance;
				}
				if (!this.autoBound) {
					soma.View.implement(AutoBindProto);
					this.autoBound = true;
				}
				if (view['shouldAutobind']) {
                    view.autobind();
                }
				views[ viewName ] = view;
				if (view[ "init" ] != null) {
					view.init();
				}
				return view;
			},

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
                this.instance = null;
			}
		});
	})();

})();

/**
 * To save instantiation latency for singular class libraries, It is recommended not to build the Class Objects upon request, if they are not used in each page where they get loaded in.<br/>
 * This static method creates a class instance by either taking the class object or the Function, that is the base for the class object creation.<br/>
 * @param {class | function} clazz Mootools Class Object or Function.
 * @param {object} parameters Parameters that get passed to the constructor.
 * @return object
 * @example
this.addWire("myWireName", soma.createClassInstance(MyWire));
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
			listeners.push({type: type, listener: listener, priority: priority,scope:this});
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
			for (i=l-1; i > -1; i--) {
				var eventObj = listeners[i];
				if (eventObj.type == type && eventObj.listener == listener) {
                    listeners.splice(i, 1);
				}
			}
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

                //testlog( event.srcElement ? event.srcElement : ( event.currentTarget ? event.currentTarget : events[i].scope ) )
                //testlog( (event.srcElement) ? event.srcEleme  nt : ( event.currentTarget ? event.currentTarget : event.scope ) )  ;
                //testlog( event.srcElement )
				//events[i].listener.apply((event.srcElement) ? event.srcElement : ( event.currentTarget ? event.currentTarget : events[i].scope ), [event]);
				//testlog(  event.currentTarget );
				//testlog(  events[i].scope);
                events[i].listener.apply((event.srcElement) ? event.srcElement : event.currentTarget, [event]);
			}
		},
        /**
         * Returns a copy of the listener array.
         * @param {Array} listeners
         */
        getListeners: function()
        {
            return listeners.slice();
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
            listeners = [];
		}
	});
})();

soma.core.Application = new Class(
	/** @lends soma.core.Application.prototype */
	{
	Extends: soma.EventDispatcher,
	Implements: soma.core.IDisposable,
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
	 * @class
	 * <b>Introduction</b><br/>
	 * SomaCore is a lightweight event-based MVC framework written in javascript that provides a structure, models, views management and commands.<br/>
	 * SomaCore is completely event-based and uses a concept of wires to code in a efficient decoupled way.<br/>
	 * SomaCore can be used for anything, except to include/distribute it in another framework, application, template, component or structure that is meant to build, scaffold or generate source files.<br/><br/>
	 * <b>Few things to know</b><br/>
	 *     - Wires are the glue of the frameworks elements (models, commands, views, wires) and can be used the way you wish, as proxy/mediators or managers.<br/>
	 *     - Wires can manage one class or multiple classes.<br/>
	 *     - Parallel and sequence commands are built-in.<br/>
	 *     - You can access to all the framework elements that you have registered (framework instance, wires, models, views, injector, reflector, mediators and commands) from commands, wires and mediators.<br/>
	 *     - Commands are native events with the bubbles property set to true.<br/>
	 *     - Commands can be executed, monitored, and stopped using native methods (dispatchEvent, addEventListener, removeEventListener, preventDefault, and so on).<br/>
	 * @description Creates a new Application and acts as the facade and main entry point of the application.<br/>
	 * The Application class can be extended to create a framework instance and start the application.
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
        this.parent();
        this.body = document.body;
		if (!this.body) {
			throw new Error("SomaCore requires body of type Element");
		}
		this.controller = new soma.core.controller.SomaController(this);
		this.models = new soma.core.model.SomaModels(this);
		this.wires = new soma.core.wire.SomaWires(this);
		this.views = new soma.core.view.SomaViews(this);
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

/**
 * @name soma.core.model.SomaModels
 * @namespace The SomaModels class handles the models of the application. See the Model class documentation for implementation.
 * @borrows soma.core.Application#addModel
 * @borrows soma.core.Application#getModel
 * @borrows soma.core.Application#getModels
 * @borrows soma.core.Application#hasModel
 * @borrows soma.core.Application#removeModel
 * @example
this.addModel("myModelName", new MyModel());
this.removeModel("myModelName");
var model = this.getModel("myModelName");
 */
soma.core.model.SomaModels = (function() {
	/** @lends soma.core.model.SomaModels.prototype */

	var models = null;

	return new Class({
		Implements: soma.core.IDisposable,

		instance:null,

		initialize:function(instance) {
			this.instance = instance;
			models = {};
		},

		hasModel: function(modelName) {
			return models[ modelName ] != null;
		},

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
            this.instance = null;
		}
	});
})();

soma.core.model.Model = new Class(
    /** @lends soma.core.model.Model.prototype */
    {

	/** Name of the model. */
	name: null,
	/** Variable that can be used to hold you data. */
	data: null,
	/** Instance of a EventDispatcher that can be used to dispatch commands. */
	dispatcher:null,

	/**
	 * @constructs
	 * @class
	 * The model is the class used to manage you application's data model.
	 * The data can be XML, local data, data retrieved from a server or anything.
	 * Ideally, the data should be set to the data property of the model instance, but you are free to create specific getters.
	 * @description Create an instance of a Model class.
	 * @param {string} name The name of the wire.
	 * @borrows soma.EventDispatcher#addEventListener
	 * @borrows soma.EventDispatcher#removeEventListener
	 * @borrows soma.EventDispatcher#hasEventListener
	 * @borrows soma.EventDispatcher#dispatchEvent
	 * @example
// add a model to the framework
this.addModel("myModelName", new MyModel());
	 * @example
// remove a model from the framework
this.removeModel("myModelName");
	 * @example
// retrieve a model
var model = this.getModel("myModelName");
	 * @example
var MyModel = new Class({
	Extends: soma.core.model.Model,

	init: function() {
		this.data = "my data example";
		// the model can be used as a dispatcher (default dispatcher is the framework instance) to dispatch commands, example:
        this.dispatchEvent(new soma.Event("dataReady"));
	},

	dispose: function() {
		this.data = null;
	}

});
MyModel.NAME = "Model::MyModel";
	 */
	initialize: function(name, data, dispatcher) {
		this.data = data;
		this.dispatcher = dispatcher;
		if (name != null) {
			this.name = name;
		}
	}

	/** Method that can you can override, called when the model has been registered to the framework. */
	,init: function() {

	}

	/** Method that can you can override, called when the model has been removed from the framework. */
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

	/** Retrieves the name of the model. */
	getName: function() {
		return this.name;
	},

	/** Sets the name of the model. */
	setName: function(name) {
		this.name = name;
	}

});

soma.View = new Class(
    /** @lends soma.View.prototype */
    {

	instance: null,
	/** {DOM Element} An optional DOM Element. */
	domElement: null,

	/**
	 * @constructs
	 * @class
	 * The View class is not dependant of the framework and is completely optional.
	 * Its purpose is to dispatch commands in an easier way.
	 * Commands can be dispatched from views and will not tight your views to the framework as they are simple native events (with a property bubbles set to true to be considered as command by the framework).
	 * The commmands must be dispatched from a DOM Element in order for the framework to catch them (see the examples).
	 * @description Create an instance of a View class.
	 * @param {DOM Element optional} domElement A DOM Element.
	 * @example
// add a view to the framework
this.addView("myViewName", new MyView());
	 * @example
// remove a view from the framework
this.removeView("myViewName");
	 * @example
// retrieve a view
var view = this.getView("myViewName");
	 * @example
// view that extends soma.View
// the event "eventType" is considered a command in this example.
var MyView = new Class({
	Extends: soma.View,

	init: function() {
		this.dispatchEvent(new soma.Event("eventType"))
	},

	dispose: function() {

	}
});
MyView.NAME = "View::MyView";

var view = new MyView();
	 * @example
// view that does not extends soma.View and uses the domElement property.
// the event "eventType" is considered a command in this example.
var MyView = new Class({

	init: function() {
		this.domElement.dispatchEvent(new soma.Event("eventType"))
	},

	dispose: function() {

	}
});
MyView.NAME = "View::MyView";

var view = new MyView(document.getElementById("myDomElement"));
	 * @example
// view that does not extends soma.View and does not use the domElement property.
// the event "eventType" is considered a command in this example.
var MyView = new Class({

	init: function() {
		var myDomElement = document.getElementById("myDomElement")
		myDomElement.dispatchEvent(new soma.Event("eventType"))
	},

	dispose: function() {

	}
});
MyView.NAME = "View::MyView";
var view = new MyView();

// another example
// the event "eventType" is considered a command in this example.
var MyView = new Class({

	init: function() {
		var button = document.getElementById("requestMessageButton");
		button.addEventListener("click", function() {
			this.dispatchEvent(new soma.Event("eventType"))
		});
	},

	dispose: function() {

	}
});
MyView.NAME = "View::MyView";
var view = new MyView();
	 */
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
	/**
	 * DOM native method. The soma.Event class can be used as a shortcut to create the event.
	 * @param {event or soma.Event} An event instance.
	 * @example
object.dispatchEvent(new soma.Event("eventType"));
	 */
	dispatchEvent: function(event) {
		if (this.domElement.dispatchEvent) {
			this.domElement.dispatchEvent(event);
		} else if (this.instance) {
			this.instance.dispatchEvent(event);
		}
	},
	/**
	 * DOM native method.
	 * @param {string} type Type of the event.
	 * @param {function} function The listener that will be notified.
	 * @param {boolean} capture Capture phase of the event.
	 * @example
object.addEventListener("eventType", eventHandler, false);
	 */
	addEventListener: function() {
        if (this.domElement.addEventListener) {
           this.domElement.addEventListener.apply(this.domElement, arguments);
        } else if(this.instance) {
            // TODO IE problem : target is now document.body
            this.instance.addEventListener.apply(this.domElement, arguments);
        }
	},
	/**
	 * DOM native method.
	 * @param {string} type Type of the event.
	 * @param {function} function The listener that will be notified.
	 * @param {boolean} capture Capture phase of the event.
	 * @example
object.removeEventListener("eventType", eventHandler, false);
	 */
	removeEventListener: function() {
        if(this.domElement.addEventListener) {
		    this.domElement.removeEventListener.apply(this.domElement, arguments);
        } else if(this.instance) {
            // TODO IE problem : target is now document.body
             this.instance.removeEventListener.apply(this.domElement, arguments);
        }
	},
	/**
	 * Optional method that will be called by the framework (if it exists) when the view is removed from the framework.
	 */
	dispose: function() {

	}
});

/**
 * @name soma.core.wire.SomaWires
 * @namespace The SomaWires class handles the wires of the application. See the Wire class documentation for implementation.
 * @borrows soma.core.Application#addWire
 * @borrows soma.core.Application#getWire
 * @borrows soma.core.Application#getWires
 * @borrows soma.core.Application#hasWire
 * @borrows soma.core.Application#removeWire
 * @example
 this.addWire("myWireName", new MyWire());
 this.removeWire("myWireName");
 var wire = this.getWire("myWireName");
 */
soma.core.wire.SomaWires = (function() {
    /** @lends soma.core.wire.SomaWires.prototype */

	var wires = null;
	return new Class({
		Implements: soma.core.IDisposable,

		instance:null,

		initialize:function(instance) {
			this.instance = instance;
			wires = {};
		},

		hasWire: function(wireName) {
			return wires[ wireName ] != null;
		},

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
            this.instance = null;
		}
	});
})();

soma.core.mediator.Mediator = new Class({

	Extends: soma.core.wire.Wire,
	Implements: soma.core.IDisposable,

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

soma.Event = new Class(
    /** @lends soma.Event.prototype */
    {
    /**
     * @constructs
     * @class Event wrapper class for the native event created with "document.createEvent".
     * @description Create an instance of an soma.Event class.
     * @param {string} type The type of the event.
     * @param {object} params An object for a custom use and that can hold data.
     * @param {boolean} bubbles Indicates whether an event is a bubbling event. If the event can bubble, this value is true; otherwise it is false. The default is true for framework purposes: the commands are mapped with events types, the framework will ignore events that are commands if the bubbles property is set to false.
     * @param {boolean} cancelable Indicates whether the behavior associated with the event can be prevented (using event.preventDefault()). If the behavior can be canceled, this value is true; otherwise it is false.
     * @returns {event} A event instance.
     * @example
// create an event
var event = new soma.Event("eventType");
var event = new soma.Event("eventType", {myData:"my data"}, true, true);
     * @example
// create an event class
var MyEvent = new Class({
    Extends: soma.Event,

    initialize: function(type, params, bubbles, cancelable) {
        // alert(params.myData)
        return this.parent(type, params, bubbles, cancelable);
    }

});
MyEvent.DO_SOMETHING = "ApplicationEvent.DO_SOMETHING"; // constant use as an event type
var event = new MyEvent(MyEvent.DO_SOMETHING, {myData:"my data"});
      */
    initialize: function(type, params, bubbles, cancelable) {
        var e = soma.Event.createGenericEvent(type, bubbles, cancelable);
		if (params != null && typeof params == "object" ) {
			e.params = params;
		}
		e.clone = this.clone.bind(e);
        e.isDefaultPrevented = this.isDefaultPrevented;
	    if (!e.preventDefault || (e.getDefaultPrevented == undefined && e.defaultPrevented == undefined ) ) e.preventDefault = this.preventDefault.bind(e);
		return e;
	},
    /**
     * Duplicates an instance of an Event subclass.
     * @returns {event} A event instance.
     */
	clone: function() {
		var e = soma.Event.createGenericEvent(this.type, this.bubbles, this.cancelable);
		e.params = this.params;
		e.isCloned = true;
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	},
	preventDefault: function() {
		if (!this.cancelable) return false;
        this.defaultPrevented = true;
        this.returnValue = false;
        return this;
	},
    /**
     * Checks whether the preventDefault() method has been called on the event. If the preventDefault() method has been called, returns true; otherwise, returns false.
     * @returns {boolean}
     */
	isDefaultPrevented: function() {
	    if (!this.cancelable) return false;
        if( this.defaultPrevented != undefined ) {
           return this.defaultPrevented;
        }else if( this.getDefaultPrevented != undefined ) {
            return this.getDefaultPrevented();
        }
        return false;
	}
});
/**
 * @static
 * @param {string} type
 * @param {boolean} bubbles
 * @param {boolean} cancelable
 * @returns {event} a generic event object
 */
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


/**
 * @name soma.core.IResponder
 * @namespace This interface provides the contract for any service that needs to respond to remote or asynchronous calls.
 * @example
var MyAsyncClass = new Class({
	Implements: soma.core.IResponder,
	fault: function(info) {
	},
	result: function(data) {
	},
});
 */
soma.core.IResponder = new Class(
    /** @lends soma.core.IResponder.prototype **/
    {
    /**
     * This method is called by a service when an error has been received.
     * @param {object} info Description of the error.
     * @name fault
     * @methodOf soma.core.IResponder#
     */
	fault: function(info) {
	},
    /**
     * This method is called by a service when the return value has been received.
     * @param {object} data Object containing the result.
     * @name result
     * @methodOf soma.core.IResponder#
     */
	result: function(data) {
	}
});

/**
 * @name soma.core.IDisposable
 * @namespace This interface provides the method that can be called to dispose the elements created inside this instance.
 * @example
var MyDisposableClass = new Class({
	Implements: soma.core.IDisposable,
	dispose: function() {
	},
});
*/
soma.core.IDisposable = new Class(
	/** @lends soma.core.IDisposable.prototype **/
	{
	/**
	 * Method will dispose the elements created.
	 * @name dispose
	 * @methodOf soma.core.IDisposable#
	 */
	dispose: function() {
	}
});
