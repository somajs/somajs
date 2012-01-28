/**
 * @author Henry Schmieder
 *
 * CHANGES: Commands, Wires, Models and Views can be created both as prototypes or Class Objects
 * ( the latter comes with larger footprint through instantiation )
 * see code below for both implementations
 *
 *
 */

var ColorCommand = soma.Command.extend({
	execute: function( e )
	{
		var commandEventName = e.type;
		var wire = this.getWire( ColorWire.NAME );
		var color = e.params.color;

		switch( commandEventName )
		{
			case CommandEventList.COLORDATA_LOAD :
				wire.loadColorData();
				break;

			case CommandEventList.COLORDATA_UPDATED :
				wire.updateViews();
				break;

			case CommandEventList.COLOR_CHANGE :
				wire.updateReceiverColor( color );
				wire.updateSquareColor( color );
				break;
		}
		if( this.isPartOfASequence( e ) ) {
			var sequencer = this.getSequencer( e );
			console.log("Sequence continue, " + sequencer.getLength() + " left!");
			sequencer.executeNextCommand();
		}
	}
	
});

var ParallelTestCommand = soma.ParallelCommand.extend({
	initializeSubCommands: function()
	{

		console.log('initialize sub command');

		var colorModel = this.getModel( ColorModel.NAME );
		this.addSubCommand( new ColorEvent( CommandEventList.COLOR_CHANGE, colorModel.getRandomColor() ) );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] ) );
	}
});


var AsyncCommand = soma.Command.extend({
	sequencer: null,
	commandEvent: null,

	execute: function( e )
	{
		this.sequencer = this.getSequencer( e );
		this.commandEvent = e;
	 	var delegate = new AsyncDelegate( this );
		delegate.call();
		console.log("waiting for response...");
	},

	onSuccess: function()
	{
		console.log( "AsyncCommand::onSuccess()");
		if( this.isPartOfASequence( this.commandEvent ) ) {
			if( this.sequencer.getLength() > 0 ) {
				 console.log("Sequence continue, " + this.sequencer.getLength() + " left!");
			}else{
				 console.log("Sequence successfully finished" );
			}
			this.sequencer.executeNextCommand();
		}else{
			console.log("Async operation successful" );
		}
	},
	onFault: function()
	{
		if( this.isPartOfASequence( this.commandEvent ) ) {
			this.sequencer.stop();
			console.log("Sequence was stopped on a fault!");
		}else{
			console.log("Async operation failed" );
		}
	}
});

var SequenceTestCommand = soma.SequenceCommand.extend({

	constructor: function()
	{
		soma.SequenceCommand.call(this, "sequencer.test" );
	},
	
	initializeSubCommands: function()
	{

		var colorModel = this.getModel( ColorModel.NAME );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ColorEvent( CommandEventList.COLOR_CHANGE, colorModel.getRandomColor() ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		
	}

});

var TweenSequenceCommand = soma.SequenceCommand.extend({

	constructor: function( id )
	{
		soma.SequenceCommand.call(this, "sequencer.tweentest" );
	},

	getSize: function() {
		var s = {};
		if (typeof window.innerWidth != 'undefined')
		{
		  s.x = window.innerWidth,
		  s.y = window.innerHeight
		}
		else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0)
		{
		   s.x = document.documentElement.clientWidth,
		   s.y = document.documentElement.clientHeight
		}
		else
		{
		   s.x = document.getElementsByTagName('body')[0].clientWidth,
		   s.y = document.getElementsByTagName('body')[0].clientHeight
		}
		return s;
	},
	
	getRandomTween: function()
	{
		var colorModel = this.getModel( ColorModel.NAME );
		var s = this.getSize();
		var stageW = s.x;
		var stageH = s.y;
		return {
			tint: colorModel.getRandomColor(),
			x: Math.floor( Math.random() * ( stageW - 100 ) ),
			y: Math.floor( Math.random() * ( stageH - 100 ) ),
			ease: Fx.Transitions.Expo.easeOut
		};
	},
	initializeSubCommands: function()
	{
		var v = this.getView( ColorWire.NAME_SQUARE );
		if( v.morph != null ) {
			v.domElement.eliminate( "morphInitialised" );
			v.morph.cancel();
			v.morph = null;
		}

		var square = this.getView( ColorWire.NAME_SQUARE ).domElement;

		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] ) );
		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] ) );
		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] ) );
		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] ) );
		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] ) );

		var lastObject = this.getRandomTween();
		lastObject.x = 20;
		lastObject.y = 300;
		this.addSubCommand( new TweenEvent( CommandEventList.TWEEN_TWEEN, [square, 1, lastObject] ) );

	}
	
});

var SequenceStopCommand = soma.Command.extend({
	execute: function( e )
	{
		console.log( "SequenceStopCommand::execute(): ", e.type, e.params );
		var v = this.getView( ColorWire.NAME_SQUARE );
		v.domElement.eliminate( "morphInitialised" );
		v.morph = null;
		this.stopAllSequencers();
	}
});

var TweenCommand = soma.Command.extend({

	sequencer:null,

	execute: function( e )
	{
		var data = e.params.tweenData;
		var tweenTarget = data[0];
		var obj = data[2];


		this.sequencer = this.getSequencer( e );
	
		var v = this.getView( ColorWire.NAME_SQUARE );

		if( tweenTarget.retrieve( "morphInitialised" ) == null ) {
			tweenTarget.store( "morphInitialised", true );
			v.morph = new Fx.Morph( v.domElement );
			v.morph.setOptions( { duration:400, onComplete: this.moveComplete.bind(this), transition:obj.ease } );
		}
		v.morph.start( {left:obj.x+"px",  top:obj.y+"px" } );
	} ,
	moveComplete: function()
	{
		if( this.sequencer.getLength() > 0 ) {
			 console.log("Sequence continue, " + this.sequencer.getLength() + " left!");
		}else{
			 console.log("Sequence successfully finished" );
		}
		this.sequencer.executeNextCommand();
	}

});

var MoveViewCommand = soma.Command.extend({
	execute: function( e )
	{
		var coords = e.params.coords;
		var view = this.getView( ColorWire.NAME_RECEIVER );
		view.updatePosition( coords[0], coords[1] );

		if( this.isPartOfASequence( e ) ) {
			var sequencer = this.getSequencer( e );
			console.log("Sequence continue, " + sequencer.getLength() + " left!");
			sequencer.executeNextCommand();
		}
	}
});