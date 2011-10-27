/**
 * Pyroma MVC Framework for JavaScript and Mootools 1.3
 * Port of the AS3 MVC framework SomaCore by Romuald Quantin (http://www.soundstep.com/blog/downloads/somacore/)
 *
 * @author Henry Schmieder
 *
 */


/** @namespace */
var soma = {};

/**
 * @class
 */
soma.Prepare =
{
    /**
     * @static
     * @param {String} path
     */
	registerPackage: function(path)
	{
		var a = path.split(".");
		var o = window;
		for (var i = 0; i < a.length; i++) {
			var name = a[i];
			if (o[name] == undefined) {
				if (i == a.length - 1) {
					var fChar = name.charAt(0);
					if (fChar != fChar.toUpperCase()) { // lc first
						o[name] = new Object();
					}
					else { // uc first
						o[name] = function(){
						};
					}
				}
				else {
					o[name] = new Object();
				}
			}
			o = o[name];
		}
	},
    /**
     * @static
     * @param {Array} aP Array of pathes
     */
	registerPackages: function(aP)
	{
		for (var i = 0; i < aP.length; i++) {
			this.registerPackage(aP[i]);
		}
	}
};
soma.Prepare.registerPackages(
	[
		"soma.core",
		"soma.core.controller",
		"soma.core.model",
		"soma.core.view",
		"soma.core.wire"
	]
);

/**
 * @class
 * @internal
 * @description
 * Acts as base class for other framework actors by providing common shared accessor functionality.
 * This class is used by the framework itself only - internal -
 */
soma.core.Share = new Class(
/** @lends soma.core.Share.prototype */
{
	/**
     * @constructs
	 * @param {String } commandEventName type of the event to be fired
	 * @param {Array} args Array of parameters to send to the event listener
	 * @param {Number} delay miliseconds the execution of the event shall be delayed
	 * @return void
	 */
	fireEvent: function( commandEventName, args, delay )
	{
		if( commandEventName instanceof Object ) {
	 		if( commandEventName.eventName != null ) {
				 /** @type soma.core.controller.SequenceCommandProxy **/
				 var _o = commandEventName;
				commandEventName = _o.eventName;
				 args = [_o.eventData];
		 	}else{
				 throw new Error( "can not resolve command:", commandEventName );
		 	}
		}else{
			if( !( args instanceof Array ) ) {
				if( args != null ) {
					args = [args];
				}else{
					args = [];
				}
			}
		}
		args.push( commandEventName );
		//console.log("soma.core.Share::fireEvent()", commandEventName, args );
		this.core.fireEvent.apply( this.core, [commandEventName, args, delay] );
	},
	
	/**
	 * 
	 * @param {String} commandEventName
	 * @param {Function} fn
	 * @return (void)
	 */
	addEvent:function( commandEventName, fn )
	{
		//console.log( "soma.core.Share::addEvent()", commandEventName );
		this.core.addEvent.apply( this.core, [commandEventName, fn] );
	},
	
	/**
	 * @description
     * Detaches a command. Be careful when removing events: the exact bound reference has to be given:
	 * @example
     * var boundDestroy = this.listener.bind( this );
	 * this.removeEvent(commandEventName, boundDestroy);
	 * 
	 * @param {String} commandEventName
	 * @param {Function} fn listener closure
	 * @return (void)
	 */
	removeEvent: function( commandEventName, fn )
	{
		this.core.removeEvent( commandEventName, fn );
	},
	
	/**
	 * 
	 * @param {String} commandEventName (command key)
	 * @return {void}
	 */
	removeEvents: function( commandEventName )
	{
		this.core.removeEvents( commandEventName );
	},
	
	/**
	 * @description checks if a command for the given key exists
	 * @param {String} commandEventName
	 * @return {Boolean}
	 */
	hasCommand: function( commandEventName )
	{
		return this.core.hasCommand( commandEventName );
	},
	
	/**
	 * @description get a command object reference
	 * @param {String} commandEventName
	 * @return {soma.core.controller.Command}
	 */
	getCommand: function( commandEventName )
	{
		return this.core.getCommand( commandEventName );
	},

    /**
     * @return {Array} list of command object references
     */
	getCommands: function()
	{
		return this.core.getCommands();	
	},
	
	/**
	 * @description subsribes a command by a unique name/key and its class object
	 * @param {String} command name
	 * @param {Class} command class
	 */
	addCommand: function( commandEventName, commandClass )
	{
		this.core.controller.addCommand( commandEventName, commandClass );
	},
	
	/**
	 * @description unsubscribes a command
	 * @param {String} commandEventName
	 * @return (void)
	 */
	removeCommand: function( commandEventName )
	{
		this.core.controller.removeCommand( commandEventName );
	},
	
	/**
	 * @description checks if a wire with the given wire name exists
	 * @param {String} wireName the unique wire name, the wire was registered for
	 * @return {Boolean}
	 */
	hasWire: function(wireName)
	{
		return this.core.hasWire( wireName );
	},
	
	/**
	 * 
	 * @param {String} wireName the unique wire name, the wire was registered for
	 * @return {soma.wire.Wire}
	 */
	getWire: function( wireName )
	{
		return this.core.getWire( wireName );
	},
	
	/**
	 * @description subsribes a wire object by a uique name and its class object
	 * @param {String} wireName
	 * @param {soma.core.Wire} wire
	 * @return {soma.core.Wire}
	 */
	addWire: function( wireName, wire )
	{
		return this.core.addWire( wireName, wire );
	},
	
	/**
	 * @description unsubscribes wire by its unique name 
	 * @param {String} wireName
	 * @return {void}
	 */
	removeWire: function( wireName )
	{
		this.core.removeWire( wireName );
	},

    /**
     *
     * @param {String} modelName
     */
	hasModel: function( modelName )
	{
		return this.core.hasModel( modelName );
	},

    /**
     *
     * @param {String} modelName
     */
	getModel: function( modelName )
	{
		return this.core.getModel( modelName );
	},

	getSequencer: function( commandEventName )
	{
		 return this.core.controller.getSequencer( commandEventName );
	},
	
	stopSequencerWithEvent: function( commandEventName )
	{
		return this.core.controller.stopSequencerWithEvent( commandEventName );	
	},

	stopSequencer: function( commandEventName )
	{
		return this.core.controller.stopSequencer( commandEventName );
	},

	stopAllSequencers: function()
	{
		this.core.controller.stopAllSequencers();
	},

	isPartOfASequence: function( commandEventName )
	{
	 	return this.core.controller.isPartOfASequence( commandEventName );
	},

	getLastSequencer: function()
	{
		return this.core.controller.getLastSequencer();
	},

	getRunningSequencers: function()
	{
		return this.core.controller.getRunningSequencers();
	},
	
    /**
     * 
     * @param {String} modelName
     * @param {soma.core.model.Model} model
     */
	addModel: function( modelName, model )
	{
		return this.core.addModel( modelName, model );
	},
	
	removeModel: function( modelName )
	{
		this.core.removeModel( modelName );
	},
	
	hasView: function( viewName )
	{
		return this.core.hasView( viewName );
	},
	
	getView: function( viewName )
	{
		return this.core.getView( viewName );
	},
	
	addView: function( viewName, view )
	{
		return this.core.addView( viewName, view );
	},
	
	removeView: function( viewName )
	{
		this.core.removeView( viewName );
	}/*,
	
	getSequencer: function()
	{
		
	},

	getLastSequencer: function()
	{
		
	} */
});


soma.core.Core = new Class(
/** @lends soma.core.Core.prototype */
{
	Implements:[ Events ],
	
	root:null,
	rootId:"pyromaRoot",
	models:null,
	controller:null,
	wires:null,
	views:null,

    /**
     *
     * @constructs
     * @description
     * This class acts as some sort of super wire orchestrating all core actor objects. A reference is stored in each core actor.
     * @see soma.core.Share
     */
	initialize:function()
	{
	   	this.injectRoot();
		this.controller = new soma.core.Controller( this );
		this.models = new soma.core.model.PyromaModels( this );
		this.wires = new soma.core.wire.PyromaWires( this );
		this.views = new soma.core.view.PyromaViews();

		this.registerModels();
		this.registerViews();
		this.registerCommands();
		this.registerWires();

		soma.core.Core.instance = this;

		this.init();
	},

    /**
     *
     * @param {String} commandEventName Event type
     * @param {Array} args Array of arguments to send to the event listener
     * @param {Number} delay Seconds the command execution is delayed
     */
	fireCoreEvent: function( commandEventName, args, delay )
	{
		this.fireEvent.apply( this, [commandEventName, [args, commandEventName], delay] );
	},

	/**
	 * TODO use this for ECMA Event system version
    */
	injectRoot: function()
	{
		/*
		var body = document.getElement("body");
		var content = body.get("html");
		var root = new Element( "div" ).setProperties( {
			id: this.rootId,
			html: content
		});
		body.set("html", "").adopt( root );
		this.root = root;
		*/
	},
	
	hasCommand: function( commandEventName )
	{
		return this.controller.hasCommand( commandEventName );
	},
	
	getCommand: function( commandEventName )
	{
		return this.controller.getCommand( commandEventName );
	},
	
	/**
	 * @return {Array} list of registered commands
	 */
	getCommands: function()
	{
		return this.controller.getCommands();
	},

    /**
     * 
     * @param {String} commandEventName Unique key that identifies the command
     * @param {soma.core.controller.Command} command
     */
	addCommand: function( commandEventName, command )
	{
		this.controller.addCommand( commandEventName, command );
	},
	
	removeCommand: function( commandEventName )
	{
		this.controller.removeCommand( commandEventName );
	},
	
	
	hasWire: function( wireName )
	{
		return this.wires.hasWire( wireName );	
	},
	
	getWire: function( wireName )
	{
		return this.wires.getWire( wireName );
	},
    
	getWires: function()
	{
		return this.wires.getWires();
	},
	
	/**
	 * 
	 * @param {String} wireName
	 * @param {soma.core.Wire} wire
	 * @return {soma.core.Wire}
	 */
	addWire: function( wireName, wire )
	{
		return this.wires.addWire( wireName, wire );
	},
	
	removeWire: function( wireName )
	{
		this.wires.removeWire( wireName );
	},
	
	
	hasModel: function( modelName )
	{
		return this.models.hasModel( modelName );		
	},

	getModels: function()
	{
		return this.models.getModels();	
	},

	getModel: function( modelName )
	{
		return this.models.getModel( modelName );
	},
	
	addModel: function( modelName, model )
	{
		return this.models.addModel( modelName, model );
	},
	
	removeModel: function( modelName )
	{
		this.models.removeModel( modelName );
	},
	
	hasView: function( viewName )
	{
		return this.views.hasView( viewName );
	},
	
	getView: function( viewName )
	{
		return this.views.getView( viewName );
	},
	
	getViews: function()
	{
		return this.views.getViews();
	},
	
	addView: function( viewName, view )
	{
		return this.views.addView( viewName, view );
	},
	
	removeView: function( viewName )
	{
		this.views.removeView( viewName );
	},
	
	registerModels: function() {},
	
	registerCommands: function(){},
	
	registerViews: function() {},
	
	registerWires: function() {},
	
	
	init: function()
	{
		
	}
	
});

soma.core.EventProxy =
{
	send: function()
	{
		soma.core.Core.instance.fireCoreEvent.apply( soma.core.Core.instance, arguments );
	}
};

soma.core.Controller = new Class(
/** @lends soma.core.Controller.prototype */
{
    /**
     * @private
     * @type soma.core.Core
     */
	core:null,

    /**
     * @private
     * @type Object
     * */
	bounds:null,

    /**
     * @private
     * @type Array
     * */
	commands: null,
	/**
     * @private
     * @type Object
     * */
	sequencers:null,
	/**
     * @private
     * @type Object
     * */
	sequencersInfo:null,
	lastSequencer:null,
    
    /**
     * @constructs
     * @param {soma.core.Core} core
     */
	initialize:function( core )
	{
		this.core = core;
		this.bounds = {};
		this.commands = {};
		this.sequencersInfo = {};
		this.sequencers = {};
	},
    
    /**
     * @private
     * @param {String} commandEventName
     */
	addInterceptor: function( commandEventName )
	{
		var bind = this.pyromaEventsHandler.bind( this );
		this.bounds[ commandEventName ] = bind;
		this.core.addEvent( commandEventName, bind );
	},
    
    /**
     * @private
     * @param {String} commandEventName
     */
	removeInterceptor: function( commandEventName )
	{
		this.core.removeEvents( commandEventName, this.bounds[ commandEventName ] );
		this.bounds[ commandEventName ] = null;
		delete this.bounds[ commandEventName ];
	},
    
    /**
     * @internal
     * @param {String} commandEventName unique command id
     * @param {Object|NULL} data
     */
	executeCommand: function( commandEventName, data )
	{
		//d("soma.core.Controller.executeCommand()", arguments);
		if( this.hasCommand( commandEventName ) ) {
			var command = new this.commands[ commandEventName ]();
			command.registerCore( this.core );
			command.execute( commandEventName, data );
		}
	},

	/**
	 *
	 * @param sequencer
	 * @param {String} commandEventName unique command id
	 * @param {soma.core.controller.SequenceCommandProxy} c
	 */
	registerSequencedCommand: function( sequencer, c )
	{
		if( !instanceOf( c, soma.core.controller.SequenceCommandProxy ) ) {
			throw new Error( "capsulate sequence commands in SequenceCommandProxy objects!");
		}
		var s = this.sequencersInfo;
		if( s[sequencer.id] == null || this.sequencers[sequencer.id] == null ) {
			this.lastSequencer = sequencer;
			s[sequencer.id] = [];
			this.sequencers[sequencer.id] = sequencer;
		}
		c.sequenceId = sequencer.id;
		s[sequencer.id].push( c );
	},

	/**
	 *
	 *
	 * @param sequencer
	 * @param {String} commandEventName unique command id
	 */
	unregisterSequencedCommand: function( sequencer, commandEventName )
	{
		if( typeOf( commandEventName ) != "string" ) {
			throw new Error( "Controller::unregisterSequencedCommand() expects commandEventName to be of type String, given:" + commandEventName );
		}
		var s = this.sequencersInfo;
		if( s[sequencer.id] != null && s[sequencer.id] != undefined ) {
			var len = s[sequencer.id].length;
			for( var i=0; i<len; i++ )
			{
				if( s[sequencer.id][i].eventName == commandEventName ) {
					s[sequencer.id][i] = null;
					s[sequencer.id].splice(i, 1);
					if( s[sequencer.id].length == 0 ) {
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
	 * @param sequencer
	 */
	unregisterSequencer: function( sequencer )
	{
		this.lastSequencer = null; // TODO verify ( not in original code )
		var s = this.sequencers;
		if( s[sequencer.id] != null && s[sequencer.id] != undefined ) {
			s[sequencer.id] = null;
			delete s[sequencer.id];
			s =  this.sequencersInfo;
			if( s[sequencer.id] != null ) {
				var len = s[sequencer.id].length;
				for( var i=0; i<len; i++ )
				{
					s[sequencer.id][i] = null;
					s[sequencer.id].splice(i, 1);
					if( s[sequencer.id].length == 0 ) {
						s[sequencer.id] = null;
						delete s[sequencer.id];
					}
					break;
				}
			}
		}
	},

	
	
	hasCommand: function( commandEventName )
	{
		return this.commands[ commandEventName ] != null;
	},

    /**
     *
     * @param {String} commandEventName
     * 
     */
	getCommand: function( commandEventName )
	{
		if( this.hasCommand(commandEventName)) {
			return this.commands[commandEventName];
		}
		return null;
	},
	
	getCommands: function()
	{
		var a = [];
		var cmds = this.commands;
		for (var c in cmds) {
			a.push(c);
		}
		return a;
	},
	
	addCommand: function( commandEventName, command )
	{
		if( this.hasCommand( commandEventName ) ) {
			throw new Error("Error in " + this + " Command \"" + commandEventName + "\" already registered.");
		}
		this.commands[ commandEventName ] = command;
		this.addInterceptor( commandEventName );
	},
	
	removeCommand: function( commandEventName )
	{
		if( !this.hasCommand( commandEventName ) ) {
			throw new Error("Error in " + this + " Command \"" + commandEventName + "\" not registered.");
		}
		this.commands[commandEventName] = null;
		delete this.commands[commandEventName];
		this.removeInterceptor(commandEventName);
	},

	/**
	 *
	 * @param {String} commandEventName
	 * @return {soma.core.controller.SequenceCommand}
	 */
	getSequencer: function( commandEventName )
	{
		var ss = this.sequencersInfo;
		for( var s  in ss )
		{
			var len = ss[s].length;
			for (var i=0; i<len; i++)
			{
				if( ss[s][i].eventName == commandEventName ) {
					return this.sequencers[ ss[s][i].sequenceId ];
				}
			}
		}
		return null;
	},

	/**
	 *
	 * @param {String} commandEventName
	 * @return Boolean
	 */
	stopSequencerWithEvent: function( commandEventName )
	{
		var ss = this.sequencersInfo;
		for( var s in ss )
		{
			var len = ss[s].length;
			for( var i=0;  i<len; i++ )
			{
				if(ss[s][i].eventName === commandEventName ) {
					this.sequencers[ ss[s][i].sequenceId ].stop();
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
	stopSequencer: function( sequencer )
	{
   		if (sequencer == null) {
	   		return false;
   		}
		sequencer.stop();
		return true;
	},

	/**
	 * @return void
	 */
	stopAllSequencers: function()
	{
		var ss = this.sequencers;
		var sis = this.sequencersInfo;
		for( var s in ss )
		{
			if( sis[s] == null ) {
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
	 * @param {String} commandEventName
	 */
	isPartOfASequence: function( commandEventName )
	{
		return ( this.getSequencer( commandEventName ) != null );
	},
	
	/**
	 * @return Array array of running sequencers
	 */
	getRunningSequencers: function()
	{
		var a = [];
		var ss = this.sequencers;
		for( var s in ss )
		{
			a.push( ss[s] );
		}
		return a;
	},

	getLastSequencer: function()
	{
		return this.lastSequencer;
	},
	
	
	// ================= LISTENERS =================
	/*
	eventsHandler: function( event )
	{
		if( this.hasCommand( event.type ) ) {
			event.stop();
			this.executeCommand( event );
		}
	}, 
	*/

    /**
     * @private
     *
     */
	pyromaEventsHandler: function()
	{
		//console.log( "soma.core.Controller::pyromaEventsHandler():", arguments )
		this.executeCommand( arguments[ arguments.length - 1 ], arguments.length > 1 ? arguments[0] : null );
	}
	
});


/**
 * @class
 * @augments soma.core.Share
 */
soma.core.controller.Command = new Class(
/**
 * @lends soma.core.controller.Command.prototype
 */
{
	Implements:[ soma.core.Share ],
	
	core: null,

    /**
     *
     * @param {soma.core.Core} core
     */
	registerCore: function( core )
	{
		this.core = core;
	},

    /**
     *
     * @param {String} eArg Command name
     */
	execute: function( eArg )
	{
		throw new Error( "Command.execute has to be implemented for \"" + eArg + "\"" );
	}

	
});


soma.core.controller.SequenceCommandProxy = new Class
({
	/** @type String **/
	eventName:null,
	/** @type Object **/
	eventData:null,
	/** @type String **/
	sequenceId:null,
	
	initialize: function( eventName, eventData )
	{
   		this.eventName = eventName;
		this.eventData = eventData;
	}
});



/**
 * @class
 * @augments soma.core.Share
 */
soma.core.controller.SequenceCommand = new Class
({
	Implements:[ soma.core.Share ],
	Extends:soma.core.controller.Command,
	commands:null,
	currentCommand:null,
	id:null,

	initialize: function( id )
	{
		if( id == null ) {
			throw new Error( "SequenceCommand Children expect an unique id as constructor arg");
		}
		this.commands = [];
		this.id = id;
	},

	registerCore: function( core )
	{
		this.core = core;
		this.initializeSubCommands();
	},

	/**
	 * @private protected
	 * To be overridden
	 */
	initializeSubCommands: function()
	{
		throw new Error( "Subclasses of SequenceCommand must implement initializeSubCommands()" );
	},
	/**
	 * 
	 * @param {String} commandEventName unique Command id
	 */
	addSubCommand: function( commandEventName, commandEventData )
	{
		var c = new soma.core.controller.SequenceCommandProxy( commandEventName, commandEventData );
		this.commands.push( c );
		this.core.controller.registerSequencedCommand( this, c );
	},

	execute: function( commandEventName )
	{
		if( this.commands == null || this.commands.length === 0 ) {
			return;
		}
		var cc = this.commands.shift();
		this.currentCommand = cc;
		if( this.hasCommand( cc.eventName ) ) {
			this.fireEvent( cc.eventName, [cc.eventData] );
		}
	},
	executeNextCommand: function()
	{
		if( this.commands == null ) {
			return;
		}
		this.core.controller.unregisterSequencedCommand( this, this.currentCommand.eventName );
		if( this.commands.length > 0 ) {
			this.execute( this.commands[0].eventName );
		}else{
			this.commands = null;
			this.currentCommand = null;
		}
	},
	getLength: function()
	{
		if( this.commands == null ) {
			return -1;
		}
		return this.commands.length;
	},
	stop: function()
	{
		this.commands = null;
		this.commands = null;
		this.currentCommand = null;
		this.core.controller.unregisterSequencer( this );
	},
	getCurrentCommand: function()
	{
		return this.currentCommand;
	},
	getCommands: function()
	{
		return this.commands;
	}
	


});


soma.core.controller.ParallelCommand = new Class
({
	Implements:[ soma.core.Share ],
	Extends:soma.core.controller.Command,
	commands:null,

	initialize: function()
	{
		this.commands = [];
	},
	registerCore: function( core )
	{
		this.core = core;
		this.initializeSubCommands();
	},
	/**
	 * @private protected
	 * To be overridden
	 */
	initializeSubCommands: function()
	{
		throw new Error( "Subclasses of ParallelCommand must implement initializeSubCommands()" );
	},
	/**
	 * @param {String} commandEventName unique Command id
	 */
	addSubCommand: function( commandEventName, commandEventData )
	{
		var c = new soma.core.controller.SequenceCommandProxy( commandEventName, commandEventData );
		this.commands.push( c );
	},

	/**
	 * @final
	 * @return void
	*/
	execute: function()
	{
		while (this.commands.length > 0) {
			/** @type soma.core.controller.SequenceCommandProxy */
			var c = this.commands.shift();
			if (this.hasCommand( c.eventName ) ) {
				this.fireEvent( c.eventName, [c.eventData]  );
			}
		}
		this.commands = null;	
	},

	/**
	 * @final
	 * @return int
	 */
	getLength: function()
	{
		return this.commands != null ? this.commands.length : -1;
	},

	/**
	 * @final
	 * @return Array array of registered commands
	 */
	getCommands: function()
	{
		return this.commands;
	}
	
});



/*********************************************** # soma.model # ************************************************/
soma.core.model.PyromaModels = new Class
({
	core:null,
	models:null,

	initialize:function( core )
	{
		this.core = core;
		this.models = {};
	},

	hasModel: function( modelName )
	{
		return this.models[ modelName ] != null;
	},

	/**
	 *
	 * @param {String} modelName
	 * @return {soma.core.model.Model}
	 */
	getModel: function( modelName )
	{
		if( this.hasModel( modelName ) ) {
			return this.models[ modelName ];
		}
		return null;
	},

	getModels: function()
	{
		var clone = {};
		var ms = this.models;
		for( var name in ms ) {
			clone[name] = ms[name];
		}
		return clone;
	},

	addModel: function( modelName, model )
	{
		if( this.hasModel( modelName ) ) {
			throw new Error( "Model \"" + modelName +"\" already exists" );
		}
		this.models[ modelName ] = model;
		model.registerCore( this.core );
		return model;
	},

	removeModel: function( modelName )
	{
		if( !this.hasModel( modelName ) ) {
			throw new Error("Error in " + this + " Model \"" + modelName + "\" not registered.");
		}
		this.models[ modelName ].dispose();
		this.models[ modelName ] = null;
		delete this.models[ modelName ];
	}
});



soma.core.model.Model = new Class
({
   name: null,

	/*
	Implements:[new Class({
		fireEvent: function( type, args, delay  ){
			d("sadasda");
			if( this.dispatcher != null && this.dispatcher["fireEvent"] != null ) {
				if( typeOf( args )  != "array" ) {
					if( args != null ) {
						args = [args];
					}else{
						args = [];
					}
				}
				args.push( type );
				this.dispatcher.fireEvent.apply( this.dispatcher, [ type, args, delay ] );
			}
		}
	})],
	*/

	data: null,
	dispatcher:null,

	initialize: function( name, data, dispatcher )
	{
		this.data = data;
		this.dispatcher = dispatcher;
		if ( name != null ) {
			this.name = name;
		}
	},

	registerCore: function( core )
	{
		this.core = core;
		this.init();
	},

	init: function()
	{

	},

	dispose: function()
	{

	}
});


/*********************************************** # soma.view # ************************************************/
soma.core.view.PyromaViews = new Class
({
   views: null,

	initialize:function()
	{
		this.views = {};
	},

	/**
	 *
	 * @param {String} viewName
	 * @return {Boolean}
	 */
	hasView: function( viewName )
	{
		return this.views[ viewName ] != null;
	},

	/**
	 *
	 * @param {String} viewName
	 * @param {soma.core.view.View} wire
	 * @return {soma.core.view.View}
	 */
	addView: function( viewName, view )
	{
		if( this.hasView( viewName ) ) {
			throw new Error( "View \"" + viewName +"\" already exists" );
		}
		this.views[ viewName ] = view;

		if( view.fireEvent != null ) {
			var of = view.fireEvent;
			view.fireEvent = function()
			{
				soma.core.EventProxy.send.apply( null, arguments );
				of.apply( view, arguments );
			}
		}

		if( this.views[ viewName ][ "initializeView" ] != null ) {
			this.views[ viewName ].initializeView();
		}
		return view;
	},

	/**
	 *
	 * @param {String} viewName
	 * @return {soma.core.view.View}
	 */
	getView: function( viewName )
	{
		if( this.hasView( viewName ) ) {
			return this.views[ viewName ];
		}
		return null;
	},

	getViews: function()
	{
		var clone = {};
		var vs = this.views;
		for( var name in vs ) {
			clone[name] = vs[name];
		}
		return clone;
	},

	removeView: function( viewName )
	{
		if( !this.hasView( viewName ) ) {
			throw new Error("Error in " + this + " View \"" + viewName + "\" not registered.");
		}
		if( this.views[ viewName ].hasOwnProperty( "dispose" ) ) {
			this.views[viewName].dispose();
		}
		this.views[ viewName ] = null;
		delete this.views[ viewName ];
	}
});


/*********************************************** # soma.wire # ************************************************/
soma.core.wire.PyromaWires = new Class
({
	core:null,
	wires:null,

	initialize:function( core )
	{
		this.core = core;
		this.wires = {};
	},

	/**
	 *
	 * @param {String} wireName
	 * @return {Boolean}
	 */
	hasWire: function( wireName )
	{
		return this.wires[ wireName ] != null;
	},

	/**
	 *
	 * @param {String} wireName
	 * @param {soma.core.wire.Wire} wire
	 * @return {soma.core.wire.Wire}
	 */
	addWire: function( wireName, wire )
	{
		if( this.hasWire( wireName ) ) {
			throw new Error( "Wire \"" + wireName +"\" already exists" );
		}
		this.wires[ wireName ] = wire;
		wire.registerCore( this.core );
		return wire;
	},

	/**
	 *
	 * @param {String} wireName
	 * @return {soma.core.wire.Wire}
	 */
	getWire: function( wireName )
	{
		if( this.hasWire( wireName ) ) {
			return this.wires[ wireName ];
		}
		return null;
	},

	getWires: function()
	{
		var clone = {};
		var ws = this.wires;
		for( var name in ws ) {
			clone[name] = ws[name];
		}
		return clone;
	},

	removeWire: function( wireName )
	{
		if( !this.hasWire( wireName ) ) {
			throw new Error("Error in " + this + " Wire \"" + wireName + "\" not registered.");
		}
		this.wires[ wireName ].dispose();
		this.wires[ wireName ] = null;
		delete this.wires[ wireName ];
	}	
});



soma.core.wire.Wire = new Class
({
	name: null,

	Implements: [soma.core.Share],

	core: null,

	initialize: function( name )
	{
		if ( name != null ) {
			this.name = name;
		}
	},

	registerCore: function( core )
	{
		this.core = core;
		this.init();
	},


	init: function()
	{

	},

	dispose: function()
	{

	}
});



