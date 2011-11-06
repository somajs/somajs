/**
 * SomaCore MVC Framework for JavaScript and Mootools 1.3
 * Port of the AS3 MVC framework SomaCore by Romuald Quantin (http://www.soundstep.com/blog/downloads/somacore/)
 *
 * @author Henry Schmieder
 * @author and a bit of me now? :D
 *
 */

/** @namespace */
var soma = {};

soma.EventDispatcher = (function() {
	var listeners = [];
	return new Class({
		addEventListener: function(type, listener, priority)
		{
			if (!type || !listener) return;
			console.log('priority check:', priority);
			if (isNaN(priority)) priority = 0;
			console.log('priority check:', priority);
			listeners.push({type: type, listener: listener, priority: priority});
			console.log('addEventListener', listeners[listeners.length-1]);
		},
		removeEventListener: function(type, listener)
		{
			console.log('removeEventListener (attempt)', type);
			if (!type || !listener) return;
			var i = 0;
			var l = listeners.length;
			for (; i<l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type && eventObj.listener == listener) {
					console.log('removeEventListener (found)', type);
					listeners.splice(i, 1);
					return;
				}
			}
			return false;
		},
		hasEventListener: function(type)
		{
			console.log('hasEventListener (attempt)', type);
			if (!type) return false;
			var i = 0;
			var l = listeners.length;
			for (; i<l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type) {
					console.log('hasEventListener (found)', type);
					return true;
				}
			}
			return false;
		},
		dispatchEvent: function(event)
		{
			console.log('dispatchEvent (attempt)', event);
			if (!event) return;
			var events = [];
			var i;
			for ( i=0; i<listeners.length; i++) {
				var eventObj = listeners[i];
				if (eventObj.type == event.type) {
					console.log('isDefaultPrevented:', event.isDefaultPrevented());
					console.log('cancelable:', event.cancelable);
					console.log('result test:', !event.isDefaultPrevented() && !event.cancelable);
					if (!event.isDefaultPrevented()) {
						console.log('dispatchEvent (found)', event);
						events.push(eventObj);
					}
				}
			}
			console.log('dispatchEvent (before sort)', events);
			events.sort(function(a, b){
				return b.priority - a.priority;
			});
			console.log('dispatchEvent (after sort)', events);
			for (i=0; i<events.length; i++) {
				console.log('dispatchEvent (is about to dispatch)', events[i]);
				events[i].listener.apply(event.currentTarget, [event]);
			}
		},
		toString: function()
		{
			return "[Class soma.EventDispatcher]";
		}
	});
})();

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
     * @param {Array} aP Array of paths
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
		"soma.core.wire",
		"soma.core.mediator"
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
		this.instance.dispatchEvent.apply( this.instance, arguments );
	},

	addEventListener: function()
	{
		this.instance.addEventListener.apply( this.instance, arguments );
	},

	removeEventListener: function()
	{
		this.instance.addEventListener.apply( this.instance, arguments );
	},

	/**
	 * @description checks if a command for the given key exists
	 * @param {String} commandEventName
	 * @return {Boolean}
	 */
	hasCommand: function( commandEventName )
	{
		return this.instance.hasCommand( commandEventName );
	},

	/**
	 * @description get a command object reference
	 * @param {String} commandEventName
	 * @return {soma.core.controller.Command}
	 */
	getCommand: function( commandEventName )
	{
		return this.instance.getCommand( commandEventName );
	},

    /**
     * @return {Array} list of command object references
     */
	getCommands: function()
	{
		return this.instance.getCommands();
	},

	/**
	 * @description subsribes a command by a unique name/key and its class object
	 * @param {String} command name
	 * @param {Class} command class
	 */
	addCommand: function( commandEventName, commandClass )
	{
		this.instance.controller.addCommand( commandEventName, commandClass );
	},

	/**
	 * @description unsubscribes a command
	 * @param {String} commandEventName
	 * @return (void)
	 */
	removeCommand: function( commandEventName )
	{
		this.instance.controller.removeCommand( commandEventName );
	},

	/**
	 * @description checks if a wire with the given wire name exists
	 * @param {String} wireName the unique wire name, the wire was registered for
	 * @return {Boolean}
	 */
	hasWire: function(wireName)
	{
		return this.instance.hasWire( wireName );
	},

	/**
	 *
	 * @param {String} wireName the unique wire name, the wire was registered for
	 * @return {soma.wire.Wire}
	 */
	getWire: function( wireName )
	{
		return this.instance.getWire( wireName );
	},

	/**
	 * @description subsribes a wire object by a uique name and its class object
	 * @param {String} wireName
	 * @param {soma.core.Wire} wire
	 * @return {soma.core.Wire}
	 */
	addWire: function( wireName, wire )
	{
		return this.instance.addWire( wireName, wire );
	},

	/**
	 * @description unsubscribes wire by its unique name
	 * @param {String} wireName
	 * @return {void}
	 */
	removeWire: function( wireName )
	{
		this.instance.removeWire( wireName );
	},

    /**
     *
     * @param {String} modelName
     */
	hasModel: function( modelName )
	{
		return this.instance.hasModel( modelName );
	},

    /**
     *
     * @param {String} modelName
     */
	getModel: function( modelName )
	{
		return this.instance.getModel( modelName );
	},

	/**
	 *
	 * @param {Event} commandEvent
	 * @return soma.core.controller.SequenceCommand
	 */
	getSequencer: function( commandEvent )
	{
		 return !!this.instance.controller ? this.instance.controller.getSequencer( commandEvent ) : null;
	},

	/**
	 *
	 * @param {Event} commandEvent
	 * @return Boolean
	 */
	stopSequencerWithEvent: function( commandEvent )
	{
		return !!this.instance.controller ? this.instance.controller.stopSequencerWithEvent( commandEvent ) : null;
	},

	/**
	 *
	 * @param {Event} commandEvent
	 */
	stopSequencer: function( commandEvent )
	{
 		if( this.instance.controller ){
			return this.instance.controller.stopSequencer( commandEvent );
		 }
	},

	stopAllSequencers: function()
	{
 		if( this.instance.controller ){
			this.instance.controller.stopAllSequencers();
		 }
	},

	/**
	 * @see soma.core.Controller.isPartOfASequence
	 * @param {Event} commandEvent
	 * @return Boolean
	 */
	isPartOfASequence: function( commandEvent )
	{
		return !!this.instance.controller ? this.instance.controller.isPartOfASequence( commandEvent ) : false;
	},

	/**
	 * @see soma.core.Controller.getLastSequencer
	 * @return soma.core.controller.SequenceCommand
	 */
	getLastSequencer: function()
	{
		return !!this.instance.controller ? this.instance.controller.getLastSequencer() : null;
	},

	/**
	 * @see soma.core.Controller.getRunningSequencers
	 * @return Array
	 */
	getRunningSequencers: function()
	{
		return !!this.instance.controller ? this.instance.controller.getRunningSequencers() : null;
	},

    /**
     *
     * @param {String} modelName
     * @param {soma.core.model.Model} model
     */
	addModel: function( modelName, model )
	{
		return this.instance.addModel( modelName, model );
	},

	removeModel: function( modelName )
	{
		this.instance.removeModel( modelName );
	},

	hasView: function( viewName )
	{
		return this.instance.hasView( viewName );
	},

	getView: function( viewName )
	{
		return this.instance.getView( viewName );
	},

	addView: function( viewName, view )
	{
		return this.instance.addView( viewName, view );
	},

	removeView: function( viewName )
	{
		this.instance.removeView( viewName );
	}
});


soma.core.Core = new Class(
/** @lends soma.core.Core.prototype */
{
	Extends: soma.EventDispatcher,
	body:null,
	models:null,
	controller:null,
	wires:null,
	views:null,

    /**
     *
     * @constructs
     * @description
     * This class acts as some sort of super wire orchestrating all core actor objects. A reference is stored in each core actor.
	 * disabling the body for dispatching events manually as at the lowest point in the display list dispatching an event
	 * a handler is not recognized for the capture phase
	 *
     * @see soma.core.Share
     */


	initialize:function()
	{
		this.body = document.body;
		//this.body.dispatchEvent = function() { throw new Error("dispatching events from soma body not allowed") };
		if( !this.body ) {
			throw new Error( "SomaCore requires body of type Element");
		}
		this.controller = new soma.core.Controller( this );
		this.models = new soma.core.model.SomaModels( this );
		this.wires = new soma.core.wire.SomaWires( this );
		this.views = new soma.core.view.SomaViews();

		this.registerModels();
		this.registerViews();
		this.registerCommands();
		this.registerWires();

		this.init();
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

	/**
	 * @return Array
	 */
	getSequencers: function()
	{
		return !!this.controller ? this.controller.getSequencers() : null;
	},

	/**
	 *
	 * @param {Event} commandEvent
	 * @return soma.core.controller.Command
	 */
	getSequencer: function( commandEvent )
	{
		return !!this.controller ? this.controller.getSequencer( commandEvent ) : null;
	},

	 /**
	 *
	 * @param {Event} commandEvent
	 * @return Boolean
	 */
	isPartOfASequence: function( commandEvent )
	{
		return ( this.getSequencer( commandEvent ) != null );
	},


	/**
	 * @see soma.core.Controller.stopSequencerWithEvent
	 * @param {Event} commandEvent
	 * @return Boolean
	 */
	stopSequencerWithEvent: function( commandEvent )
	{
		return !!this.controller ? this.controller.stopSequencerWithEvent( commandEvent ) : false;
	},

	/**
	 * @param {soma.core.controller.Command} sequencer
	 * @return Boolean
	 */
	stopSequencer: function( sequencer )
	{
		return !!this.controller ? this.controller.stopSequencer( sequencer ) : false;
	},


	stopAllSequencers: function()
	{
		if( this.controller ) {
			this.controller.stopAllSequencers();
		}
	},


	/**
	 *  @return Array
	 */
	 getRunningSequencers: function()
	 {
		return !!this.controller ? this.controller.getRunningSequencers() : null;
	 },

	/**
	 * @return soma.core.controller.Command
	 */
	getLastSequencer: function()
	{
		return !!this.controller ? this.controller.getLastSequencer() : null;
	},


	dispose: function()
	{
		if ( this.models ) { this.models.dispose(); this.models = null; }
		if ( this.views) { this.views.dispose(); this.views = null; }
		if ( this.controller) { this.controller.dispose(); this.controller = null; }
		if (this.wires) { this.wires.dispose(); this.wires = null; }
		if (this.mediators) { this.mediators.dispose(); this.mediators = null; }
	},


	init: function()
	{

	}

});

soma.core.Controller = new Class(
/** @lends soma.core.Controller.prototype */
{
    /**
     * @private
     * @type soma.core.Core
     */
	instance:null,

	boundInstance:null,

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
	 * @type Event
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
	initialize:function( instance )
	{
		this.instance = instance;
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

		// handle events dispatched from the domTree
		this.instance.body.addEventListener( commandEventName, this.boundDomtree, true );

		// handle events dispatched from the Soma facade
		this.instance.addEventListener( commandEventName, this.boundInstance, Number.NEGATIVE_INFINITY);

	},


    /**
     * @private
     * @param {String} commandEventName
     */
	removeInterceptor: function( commandEventName )
	{
		this.instance.body.removeEventListener( commandEventName, this.boundDomtree, true );
		this.instance.removeEventListener( commandEventName, this.boundInstance);
	},

    /**
     * @internal
     * @param {Event} e
     */
	executeCommand: function( e )
	{
		var commandEventType = e.type;
		if( this.hasCommand( commandEventType ) ) {
			var command = soma.createClassInstance( this.commands[ commandEventType ] );
			command.registerInstance( this.instance );
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
		if( !( c instanceof soma.core.controller.SequenceCommandProxy ) ) {
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
	 * @param {soma.core.controller.SequenceCommand} sequencer
	 * @return Boolean
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
				}
				s[sequencer.id] = null;
				delete s[sequencer.id];
				return true;
			}
		}
		return false;
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
	 * @param {Event} commandEvent
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
					var seq = this.sequencers[ ss[s][i].sequenceId ];
					return !!seq ? seq : null;
				}
			}
		}
		return null;
	},

	/**
	 *  Stops a sequence command using an event object that has been created from this sequence command.
	 * @param {Event} commandEvent
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
					try{
						this.sequencers[ ss[s][i].sequenceId ].stop();
					}catch( e ) {
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
	 * @param {Event} commandEvent
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
		//d("domtreeHandler", e.eventPhase );
		if( e.bubbles && this.hasCommand( e.type ) && !e.isCloned ) {

			e.stopPropagation();
			var clonedEvent = e.clone();
			// store a reference of the events not to dispatch it twice
			// in case it is dispatched from the display list
			this.lastEvent = clonedEvent;
			this.instance.dispatchEvent( clonedEvent );
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
		//d(e);
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

	instance: null,

    /**
     *
     * @param {soma.core.Core} instance
     */
	registerInstance: function( instance )
	{
		this.instance = instance;
	},

    /**
     *
     * @param {Event} e
     */
	execute: function( e )
	{
		throw new Error( "Command.execute has to be implemented for \"" + e + "\"" );
	}


});


soma.core.controller.SequenceCommandProxy = new Class
({
	/** @type Event **/
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

	registerInstance: function( instance )
	{
		this.instance = instance;
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
	 * @param {Event} commandEvent
	 */
	addSubCommand: function( e )
	{
		var c = new soma.core.controller.SequenceCommandProxy( e );
		this.commands.push( c );
		this.instance.controller.registerSequencedCommand( this, c );
	},

	 /**
	  *
	  * @param {Event} commandEvent
	  * @return void
	  */
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

	 /**
	  * @return void
	  */
	executeNextCommand: function()
	{
		if( this.commands == null ) {
			return;
		}
		this.instance.controller.unregisterSequencedCommand( this, this.currentCommand.event.type );
		if( this.commands.length > 0 ) {
			this.execute( this.commands[0].event );
		}else{
			this.commands = null;
			this.currentCommand = null;
		}
	},

	 /**
	  * @return Number
	  */
	getLength: function()
	{
		if( this.commands == null ) {
			return -1;
		}
		return this.commands.length;
	},

	 /**
	  * @return Boolean
	  */
	stop: function()
	{
		this.commands = null;
		this.commands = null;
		this.currentCommand = null;
		return this.instance.controller.unregisterSequencer( this );
	},

	 /**
	  * @return soma.core.controller.SequenceCommand
	  */
	getCurrentCommand: function()
	{
		return this.currentCommand;
	},

	 /**
	  * @return Array
	  */
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
	registerInstance: function( instance )
	{
		this.instance = instance;
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
	 * @param {Event} command associated event
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
			/** @type Event */
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
	instance:null,
	models:null,

	initialize:function( instance )
	{
		this.instance = instance;
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
		model.registerDispatcher( this.instance );
		model.init();
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

	initialize: function( name, data, dispatcher )
	{
		this.data = data;
		this.dispatcher = dispatcher;
		if ( name != null ) {
			this.name = name;
		}
	}

	,registerDispatcher: function( dispatcher )
	{
		this.dispatcher = dispatcher;
	}
	/**
	 * to be overridden
	 */
	,init: function()
	{

	}

	,dispose: function()
	{

	},

	dispatchEvent: function()
	{
		if (this.dispatcher) {
			this.dispatcher.dispatchEvent.apply( this.dispatcher, arguments );
		}
	},

	addEventListener: function()
	{
		if (this.dispatcher) {
			this.dispatcher.addEventListener.apply( this.dispatcher, arguments );
		}
	},

	removeEventListener: function()
	{
		if (this.dispatcher) {
			this.dispatcher.addEventListener.apply( this.dispatcher, arguments );
		}
	}

});


/*********************************************** # soma.view # ************************************************/
soma.View = new Class
({
	domElement: null,
	initialize: function( domElement )
	{
		if( domElement ) {
			this.domElement = domElement instanceof Element ? domElement : document.id( domElement );
		}
		if( !domElement) {
			this.domElement = document.body;
		}
	},
	dispatchEvent: function( event )
	{
		this.domElement.dispatchEvent( event );
	},
	addEventListener: function()
	{
		this.domElement.addEventListener.apply( this.domElement, arguments );
	},
	removeEventListener: function()
	{
		this.domElement.removeEventListener.apply( this.domElement, arguments );
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

		if( this.views[ viewName ][ "init" ] != null ) {
			this.views[ viewName ].init();
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
		if (this.views[viewName]["dispose"] != null) {
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
	instance:null,
	wires:null,

	initialize:function( instance )
	{
		this.instance = instance;
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
		wire.registerInstance( this.instance );
		wire.init();
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

	instance: null,

	initialize: function( name )
	{
		if ( name != null ) {
			this.name = name;
		}
	},

	registerInstance: function( instance )
	{
		this.instance = instance;
	},


	init: function()
	{

	},

	dispose: function()
	{

	}
});

/*********************************************** # soma.mediator # ************************************************/

soma.core.mediator.Mediator = new Class({
	
	Extends: soma.core.wire.Wire,

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

/*********************************************** # event # ************************************************/


soma.Event = new Class
({
	props: {},
	initialize: function( type, bubbles, cancelable, data )
	{
		var e = document.createEvent("Event");
		e.initEvent(
			type,
			bubbles !== undefined ? bubbles : true,
			cancelable !== undefined ? cancelable : false
		);
		e.cancelable = cancelable !== undefined ? cancelable : false;
		for( var k in data )
		{
			e[k] = data[k];
		}
		e.data = data;
		e.clone = this.clone.bind(e);
		e.isDefaultPrevented = this.isDefaultPrevented;
		return e;
	 },
	clone: function()
	{
		var e = document.createEvent("Event");
		e.initEvent(
			this.type,
			this.bubbles,
			this.cancelable
		);
		var d = this.data;
		for( var k in d )
		{
			e[k] = d[k];
		}
		e.data = d;
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

soma.core.IResponder = new Class({
	fault: function(info){},
	result: function(data) {}
});

