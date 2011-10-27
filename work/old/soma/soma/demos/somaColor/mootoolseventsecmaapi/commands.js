/**
 * @author Henry Schmieder
 */
(function() {
	StartCommand = new Class
	({
		Extends: soma.core.controller.Command,

		execute: function( type, data )
		{
			console.log( "StartCommand::execute():", type, data );
			this.addWire( ColorWire.NAME, new ColorWire() );
			this.dispatchEvent( CommandEventList.COLORDATA_LOAD );
		}
	});
})();




var ColorCommand = new Class
({
	Extends:soma.core.controller.Command,

	execute: function( commandEventName, data )
	{
		console.log( "ColorCommand.execute()", commandEventName, data );

		var wire = this.getWire( ColorWire.NAME );
		var color = data;
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
		if( this.isPartOfASequence( commandEventName ) ) {
			var sequencer = this.getSequencer( commandEventName );
			d("Sequence continue, " + sequencer.getLength() + " left!");
			sequencer.executeNextCommand();
		}
	}
	
});

var ParallelTestCommand = new Class
({
	Extends: soma.core.controller.ParallelCommand,

	initializeSubCommands: function()
	{
		var colorModel = this.getModel( ColorModel.NAME );
		this.addSubCommand( CommandEventList.COLOR_CHANGE, colorModel.getRandomColor() );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] );
	}
});

var AsyncCommand = new Class
({
	Extends: soma.core.controller.Command,

	/** @type soma.core.controller.SequenceCommand **/
	sequencer: null,
	commandEventName: null,
	
	execute: function( commandEventName, data )
	{
		this.sequencer = this.getSequencer( commandEventName );
		this.commandEventName = commandEventName;
	 	var delegate = new AsyncDelegate( this );
		delegate.call();
		d("waiting for response...");
	},

	onSuccess: function()
	{
		if( this.isPartOfASequence( this.commandEventName ) ) {
			if( this.sequencer.getLength() > 0 ) {
				 d("Sequence continue, " + this.sequencer.getLength() + " left!");
			}else{
				 d("Sequence successfully finished" );
			}
			this.sequencer.executeNextCommand();
		}else{
			d("Async operation successful" );
		}
	},
	onFault: function()
	{
		if( this.isPartOfASequence( this.commandEventName ) ) {
			this.sequencer.stop();
			d("Sequence was stopped on a fault!");
		}else{
			d("Async operation failed" );
		}
	}
});

var SequenceTestCommand = new Class
({
	Extends: soma.core.controller.SequenceCommand,

	initialize: function()
	{
		this.parent( "sequencer.test" );
	},
	
	initializeSubCommands: function()
	{
		var colorModel = this.getModel( ColorModel.NAME );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
		this.addSubCommand( CommandEventList.COLOR_CHANGE, [ colorModel.getRandomColor() ] );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
		this.addSubCommand( CommandEventList.ASYNC_CALL );
	}

});

var TweenSequenceCommand = new Class
({
	Extends: soma.core.controller.SequenceCommand,

	initialize: function( id )
	{
		this.parent( "sequencer.tweentest" );	
	},
	
	getRandomTween: function()
	{
		var colorModel = this.getModel( ColorModel.NAME );
		var s = document.body.getSize();
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
			v.el.eliminate( "morphInitialised" );
			v.morph.cancel();
			v.morph = null;
		}
		d("TweenS init subcommands")
		var square = this.getView( ColorWire.NAME_SQUARE ).el;
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] );
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] );
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] );
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] );
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [ square, 1, this.getRandomTween() ] );
		var lastObject = this.getRandomTween();
		lastObject.x = 20;
		lastObject.y = 300;
		this.addSubCommand( CommandEventList.TWEEN_TWEEN, [square, 1, lastObject] );
	}
	
});

var SequenceStopCommand = new Class
({
	Extends:soma.core.controller.Command,

	execute: function( type, data )
	{
		d( "SequenceStopCommand::execute(): ", type, data );
		var v = this.getView( ColorWire.NAME_SQUARE );
		v.el.eliminate( "morphInitialised" );
		v.morph = null;
		this.stopAllSequencers();
	}
});

var TweenCommand = new Class
({
	Extends: soma.core.controller.Command,

	execute: function( commandEventName, data )
	{
		d("TweenCommand::execute()", data );
		var tweenTarget = data[0];
		var obj = data[2];

		/** @type {soma.core.controller.SequenceCommand}  **/
		var s = this.getSequencer( commandEventName );
		if( !s ) {
			return;
		}
		
		var v = this.getView( ColorWire.NAME_SQUARE );


		if( tweenTarget.retrieve( "morphInitialised" ) == null ) {
			tweenTarget.store( "morphInitialised", true );
			v.morph = new Fx.Morph( v.el );
			v.morph.setOptions( { duration:400, onComplete: s.executeNextCommand.bind( s ), transition:obj.ease } );
		}
		v.morph.start( {left:obj.x+"px",  top:obj.y+"px" } );
	}

});

var MoveViewCommand = new Class
({
   	Extends: soma.core.controller.Command,

	execute: function( commandEventName, data )
	{
		console.log( "MoveViewCommand.execute()", commandEventName, data );
		var view = this.getView( ColorWire.NAME_RECEIVER );
		view.updatePosition( data[0], data[1] );

		if( this.isPartOfASequence( commandEventName ) ) {
			var sequencer = this.getSequencer( commandEventName );
			d("Sequence continue, " + sequencer.getLength() + " left!");
			sequencer.executeNextCommand();
		}
	}
});