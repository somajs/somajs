/**
 * @author Henry Schmieder
 */
(function() {
	StartCommand = new Class
	({
		Extends: soma.core.controller.Command,

		/**
		 *
		 * @param {soma.Event} e
		 */
		execute: function( e )
		{
			console.log( "StartCommand::execute():", e.type );
			this.addWire( ColorWire.NAME, new ColorWire() );
			this.dispatchEvent( new ColorEvent( CommandEventList.COLORDATA_LOAD ) );
		}
	});
})();


var ColorCommand = new Class
({
	Extends:soma.core.controller.Command,

	/**#
	 *
	 * @param {ColorEvent} e
	 */
	execute: function( e )
	{
		console.log( "ColorCommand.execute()", e.type );
		var commandEventName = e.type;
		var wire = this.getWire( ColorWire.NAME );
		var color = e.color;
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
		this.addSubCommand( new ColorEvent( CommandEventList.COLOR_CHANGE, colorModel.getRandomColor() ) );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] ) );
	}
});

var AsyncCommand = new Class
({
	Extends: soma.core.controller.Command,

	/** @type soma.core.controller.SequenceCommand **/
	sequencer: null,
	commandEvent: null,

	/**
	 *
	 * @param {soma.Event} e
	 */
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
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ColorEvent( CommandEventList.COLOR_CHANGE, [ colorModel.getRandomColor() ] ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.addSubCommand( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [ newX, newY ] ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		this.addSubCommand( new ChainEvent( CommandEventList.ASYNC_CALL ) );
		
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
			v.viewElement.eliminate( "morphInitialised" );
			v.morph.cancel();
			v.morph = null;
		}

		var square = this.getView( ColorWire.NAME_SQUARE ).viewElement;
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

var SequenceStopCommand = new Class
({
	Extends:soma.core.controller.Command,

	execute: function( type, data )
	{
		console.log( "SequenceStopCommand::execute(): ", type, data );
		var v = this.getView( ColorWire.NAME_SQUARE );
		v.viewElement.eliminate( "morphInitialised" );
		v.morph = null;
		this.stopAllSequencers();
	}
});

var TweenCommand = new Class
({
	Extends: soma.core.controller.Command,

	/** @type {soma.core.controller.SequenceCommand}  **/
	sequencer:null,

	/**
	 *
	 * @param {TweenEvent} e
	 */
	execute: function( e )
	{
		var data = e.tweenData;
		var tweenTarget = data[0];
		var obj = data[2];


		this.sequencer = this.getSequencer( e );
	
		var v = this.getView( ColorWire.NAME_SQUARE );

		if( tweenTarget.retrieve( "morphInitialised" ) == null ) {
			tweenTarget.store( "morphInitialised", true );
			v.morph = new Fx.Morph( v.viewElement );
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

var MoveViewCommand = new Class
({
   	Extends: soma.core.controller.Command,

	/**
	 *
	 * @param {MoveEvent} e
	 */
	execute: function( e )
	{
		var coords = e.coords;
		var view = this.getView( ColorWire.NAME_RECEIVER );
		view.updatePosition( coords[0], coords[1] );

		if( this.isPartOfASequence( e ) ) {
			var sequencer = this.getSequencer( e );
			console.log("Sequence continue, " + sequencer.getLength() + " left!");
			sequencer.executeNextCommand();
		}
	}
});