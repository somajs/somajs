/**
 * SomaCore MVC Framework for JavaScript and Mootools 1.3
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

soma.Util =
{
	isElementInDisplayList: function( element )
	{
  		while (element) {
        	if (element == document) {
            	return true;
        	}
	 		element = element.parentNode;
		}
    	return false;
	}
};


/**
 * to save instantiation latency for singular class libraries, I recommend not building the Class Objects upopn
 * request, if they are not used in each page where they get loaded in.
 * This static method creates a class instance by either taking the class object or the Function, that
 * is base for the class object creation
 *
 * @param {Class | Function} clazz Mootools Class Object or Function
 * @param {Object} constructorObj Object that gets passed as constructor argument
 * @return Object
 */
soma.createClassInstance = function( clazz, constructorObj )
{
	var obj;
	if( clazz.$constructor == Class  ) {
		obj = new clazz( constructorObj );
	}else{
		obj = new ( new Class( new clazz() ) )( constructorObj );
	}
	return obj;
};




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
	
	 dispatchEvent: function()
	 {
	 	this.core.instanceElement.dispatchEvent.apply( this.core.instanceElement, arguments );
	 },
	

	/**
	 *
	 * @param {String} commandEventName
	 * @param {Function} fn
	 * @return (void)
	 * @deprecated
	 */
	/*
	addEvent:function( commandEventName, fn )
	{
		this.core.addEvent.apply( this.core, [commandEventName, fn] );
	},
	*/

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
	 *   @deprecated
	 */
	/*
	removeEvent: function( commandEventName, fn )
	{
		this.core.removeEvent( commandEventName, fn );
	},
	*/

	/**
	 *
	 * @param {String} commandEventName (command key)
	 * @return {void}
	 * @deprecated
	 */
	/*
	removeEvents: function( commandEventName )
	{
		this.core.removeEvents( commandEventName );
	},
	*/

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

	getSequencer: function( commandEvent )
	{
		 return this.core.controller.getSequencer( commandEvent );
	},

	stopSequencerWithEvent: function( commandEvent )
	{
		return this.core.controller.stopSequencerWithEvent( commandEvent );
	},

	stopSequencer: function( commandEvent )
	{
		return this.core.controller.stopSequencer( commandEvent );
	},

	stopAllSequencers: function()
	{
		this.core.controller.stopAllSequencers();
	},

	isPartOfASequence: function( commandEvent )
	{
	 	return this.core.controller.isPartOfASequence( commandEvent );
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
	}
});


soma.core.Core = new Class(
/** @lends soma.core.Core.prototype */
{
	stageId:"somaStage"
	,stage:null
	,instanceElement:null
	,models:null
	/**
	 * @type soma.core.Controller
	 */
	,controller:null
	,wires:null
	,views:null

    /**
     *
     * @constructs
     * @description
     * This class acts as some sort of super wire orchestrating all core actor objects. A reference is stored in each core actor.
	 * disabling the stage for dispatching events manually as at the lowest point in the display list dispatching an event
	 * a handler is not recognized for the capture phase
	 *
     * @see soma.core.Share
     */


	,initialize:function()
	{
		var element = document.createElement( "div" );
		element.setProperty( "id", "somaInstanceElement" + (++soma.core.Core.instanceCount));
		this.instanceElement = element;
		this.stage = document.body;
		//this.stage.dispatchEvent = function() { throw new Error("dispatching events from soma stage not allowed") };
		if( !this.stage ) {
			throw new Error( "SomaCore requires stage of type Element");
		}
		this.controller = new soma.core.Controller( this );
		this.models = new soma.core.model.SomaModels( this );
		this.wires = new soma.core.wire.SomaWires( this );
		this.views = new soma.core.view.SomaViews();

		this.registerModels();
		this.registerViews();
		this.registerCommands();
		this.registerWires();

		soma.core.Core.instance = this;

		this.init();
	},

	
	/**
	 * @param {String} type
	 * @param {soma.Event} event
	 */
	dispatchEvent: function()
	{
		this.instanceElement.dispatchEvent.apply( this.instanceElement, arguments );
	},

	addEventListener: function()
	{
		var args = arguments;
		args[2] = true;

		// simulating event execution priority. user defined eventhandler gets always stacked in a way the soma intance eventhandler
		// gets triggered after the user handler in any case, no matter of the order the listeners get added
		var el = this.instanceElement;
		var b = this.controller.boundInstance;
		el.addEventListener.apply( el, args );
		el.removeEventListener( args[0], b, false );
		el.addEventListener( args[0], b, false );
	},

	removeEventListener: function()
	{
		var args = arguments;
		args[2] = true;
		var el = this.instanceElement;
  		el.removeEventListener.apply( el, args );
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

    getModels: function()
	{
		return this.models.getModels();
	},

	hasModel: function( modelName )
	{
		return this.models.hasModel( modelName );
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

	dispose: function()
	{
		if ( this.models) { this.models.dispose(); this.models = null; }
		if ( this.views) { this.views.dispose(); this.views = null; }
		if ( this.controller) { this.controller.dispose(); this.controller = null; }
		if (this.wires) { this.wires.dispose(); this.wires = null; }
		if (this.mediators) { this.mediators.dispose(); this.mediators = null; }
	},


	init: function()
	{

	}

});
soma.core.Core.instanceCount = 0;


soma.core.Controller = new Class(
/** @lends soma.core.Controller.prototype */
{
    /**
     * @private
     * @type soma.core.Core
     */
	core:null,

	boundInstance:null,

	boundDomtree: null,

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
	 *
	 * @type soma.Event
	 */
	lastEvent: null,


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
		this.commands = {};
		this.sequencersInfo = {};
		this.sequencers = {};
		this.boundInstance = this.instanceHandler.bind(this);
		this.boundDomtree = this.domTreeHandler.bind(this);
	},


    /**
     * @private
     * @param {String} commandEventName
     */
	addInterceptor: function( commandEventName )
	{
		if( !soma["core"] ) {
			throw new Error( "soma package has been overwritten by local variable");
		}
		// handle events dispatched from the root/stage
		//this.core.stage.addEventListener( commandEventName, this.boundDomtree, false );    // TODO: check necissity to dispatch from stage

		// handle events dispatched from the domTree
		this.core.stage.addEventListener( commandEventName, this.boundDomtree, true );

		// handle events dispatched from the Soma facade
		this.core.instanceElement.addEventListener( commandEventName, this.boundInstance, false );


	},


    /**
     * @private
     * @param {String} commandEventName
     */
	removeInterceptor: function( commandEventName )
	{
		this.core.stage.removeEventListener( commandEventName, this.boundDomtree, false );
		this.core.stage.removeEventListener( commandEventName, this.boundDomtree, true );
		this.core.instanceElement.removeEventListener( commandEventName, this.boundInstance, false );
	},

    /**
     * @internal
     * @param {soma.Event} e
     */
	executeCommand: function( e )
	{
		var commandEventType = e.type;
		if( this.hasCommand( commandEventType ) ) {
			var command = soma.createClassInstance( this.commands[ commandEventType ] );
			command.registerCore( this.core );
			command.execute( e );
		}
	},

	/**
	 *
	 * @param sequencer
	 * @param {soma.core.controller.SequenceCommandProxy} c
	 */
	registerSequencedCommand: function( sequencer, c )
	{
		// TODO remove Mootools dependency, replace instanceOf
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
		if( typeof commandEventName  != "string" ) {
			throw new Error( "Controller::unregisterSequencedCommand() expects commandEventName to be of type String, given:" + commandEventName );
		}
		var s = this.sequencersInfo;
		if( s[sequencer.id] != null && s[sequencer.id] != undefined ) {
			var len = s[sequencer.id].length;
			for( var i=0; i<len; i++ )
			{
				if( s[sequencer.id][i].event.type == commandEventName ) {
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

	clearCommands: function()
	{
		for (var nameCommand in this.commands) {
			this.removeCommand(nameCommand);
		}
	},



	/**
	 *
	 * @param {soma.Event} commandEvent
	 * @return {soma.core.controller.SequenceCommand}
	 */
	getSequencer: function( commandEvent )
	{
		var ss = this.sequencersInfo;
		for( var s  in ss )
		{
			var len = ss[s].length;
			for (var i=0; i<len; i++)
			{
				if( ss[s][i] && ss[s][i].event.type === commandEvent.type ) {
					return this.sequencers[ ss[s][i].sequenceId ];
				}
			}
		}
		return null;
	},

	/**
	 *
	 * @param {soma.Event} commandEvent
	 * @return Boolean
	 */
	stopSequencerWithEvent: function( commandEvent )
	{
		var ss = this.sequencersInfo;
		for( var s in ss )
		{
			var len = ss[s].length;
			for( var i=0;  i<len; i++ )
			{
				if(ss[s][i].event.type === commandEvent.type ) {
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
	 * @param {soma.Event} commandEvent
	 */
	isPartOfASequence: function( commandEvent )
	{
		return ( this.getSequencer( commandEvent ) != null );
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

	dispose: function()
	{
		this.clearCommands();
		for (var nameSequencer in this.sequencers) {
			this.sequencers[nameSequencer] = null;
			delete this.sequencers[nameSequencer];
		}
		this.commands = null;
		this.sequencers = null;
		this.lastEvent = null;
		this.lastSequencer = null;
	},

	// ================= LISTENERS ================

    /**
     * @private
     *
     */
	domTreeHandler: function( e )
	{
		 d("domtreeHandler", e.eventPhase );
		if( e.bubbles && this.hasCommand( e.type ) && !e.isCloned ) {

			e.stopPropagation();
			var clonedEvent = e.clone();
			// store a reference of the events not to dispatch it twice
			// in case it is dispatched from the display list
			this.lastEvent = clonedEvent;
			this.core.instanceElement.dispatchEvent( clonedEvent );
			if( !clonedEvent.isDefaultPrevented() ) {
				this.executeCommand( e );
			}
			this.lastEvent = null;
		}
	},


	/**
	 * @private
	 */
	instanceHandler: function( e )
	{
		d("instanceHandler");
		if( e.bubbles && this.hasCommand( e.type ) ) {
			// if the event is equal to the lastEvent, this has already been dispatched for execution
			if( this.lastEvent != e ) {
				if( !e.isDefaultPrevented() ) {
					this.executeCommand( e );
				}
			}
		}
	   this.lastEvent = null;
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
     * @param {soma.Event} e
     */
	execute: function( e )
	{
		throw new Error( "Command.execute has to be implemented for \"" + e + "\"" );
	}


});


soma.core.controller.SequenceCommandProxy = new Class
({
	/** @type soma.Event **/
	event:null,
	/** @type String **/
	sequenceId:null,

	initialize: function( event )
	{
   		this.event = event;
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
	 * @param {soma.Event} commandEvent
	 */
	addSubCommand: function( e )
	{
		var c = new soma.core.controller.SequenceCommandProxy( e );
		this.commands.push( c );
		this.core.controller.registerSequencedCommand( this, c );
	},

	execute: function( commandEvent )
	{
		if( this.commands == null || this.commands.length === 0 ) {
			return;
		}
		this.currentCommand = this.commands.shift();
		if( this.hasCommand( this.currentCommand.event.type ) ) {
			this.dispatchEvent( this.currentCommand.event );
		}
	},
	executeNextCommand: function()
	{
		if( this.commands == null ) {
			return;
		}
		this.core.controller.unregisterSequencedCommand( this, this.currentCommand.event.type );
		if( this.commands.length > 0 ) {
			this.execute( this.commands[0].event );
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
	 * @param {soma.Event} command associated event
	 */
	addSubCommand: function( e )
	{
		this.commands.push( e );
	},

	/**
	 * @final
	 * @return void
	*/
	execute: function()
	{
		while (this.commands.length > 0) {
			/** @type soma.Event */
			var c = this.commands.shift();
			if (this.hasCommand( c.type ) ) {
				this.dispatchEvent( c );
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
soma.core.model.SomaModels = new Class
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
		model.registerDispatcher( this.core.stage );
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
	},

	dispose: function()
	{
		for (var name in this.models) {
			this.removeModel(name);
		}
		this.models = null;
	}
});



soma.core.model.Model = new Class
({
	name: null,
	data: null,
	dispatcher:null,
	inited: false,

	initialize: function( name, data, dispatcher )
	{
		this.data = data;
		this.dispatcher = dispatcher;
		if ( name != null ) {
			this.name = name;
		}
	}

	,registerCore: function( core )
	{
		this.core = core;
	}

	,registerDispatcher: function( dispatcher )
	{
		if( this.inited ) {
			return;
		}
		if( !this.dispatcher ) {
			this.dispatcher = dispatcher;
		}
		this.inited = true;
		this.init();
	}
	/**
	 * to be overridden
	 */
	,init: function()
	{

	}

	,dispose: function()
	{

	}
});


/*********************************************** # soma.view # ************************************************/
soma.View = new Class
({
	viewElement: null,
	initialize: function( domElement )
	{
		if( domElement ) {
			this.viewElement = domElement instanceof Element ? domElement : document.id( domElement );
		}
		if( !domElement || this.viewElement.parentNode === null || this.viewElement.parentNode === undefined ) {
			throw new Error( "SomaView constructor has to be given a dom element, that is a node of the dom tree." );
		}
	},
	dispatchEvent: function( event )
	{
		this.viewElement.dispatchEvent( event );
	},
	addEventListener: function()
	{
		this.viewElement.addEventListener.apply( this.viewElement, arguments );
	},
	removeEventListener: function()
	{
		this.viewElement.removeEventListener.apply( this.viewElement, arguments );
	}
});



soma.core.view.SomaViews = new Class
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
	},

	dispose: function()
	{
	 	for (var name in this.views) {
			this.removeView(name);
		}
		this.views = null;
	}
});


/*********************************************** # soma.wire # ************************************************/
soma.core.wire.SomaWires = new Class
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
	},

	dispose: function()
	{
	 	for (var name in this.wires) {
			this.removeWire(name);
		}
		this.wires = null;
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


soma.Event = new Class
({
	props: null,
	initialize: function( type, bubbles, cancelable, data )
	{
		//var e = document.createEvent("Event");
		var e = document.createEvent("HTMLEvents");
		e.initEvent(
			type,
			bubbles !== undefined ? bubbles : true,
			cancelable !== undefined ? cancelable : true
		);
		e.cancelable = cancelable !== undefined ? cancelable : true;
		if( data !== undefined && data !== null ) {
			this.addProp( "data", data );
		}
		for( var k in this.props )
		{
			e[k] = this.props[k];
		}
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	 },
	addProp: function( name, value )
	{
		this.props = !!this.props ? this.props : {};
		this.props[ name ] = value;
	},
	clone: function()
	{
		var e = document.createEvent("HTMLEvents");
		e.initEvent(
			this.type,
			this.bubbles,
			this.cancelable
		);
		e.props = this.props;
		e.isCloned = true;
		e.clone = this.clone;
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	},
	isDefaultPrevented: function()
	{
		if( this.getDefaultPrevented ) {
			return this.getDefaultPrevented();
		}else{
			return this.defaultPrevented;
		}
	}
});







