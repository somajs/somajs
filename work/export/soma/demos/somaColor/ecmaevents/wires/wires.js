/**
 * @author Henry Schmieder
 */

var ColorWire = function() {};
ColorWire.prototype =
{
	Extends: soma.core.wire.Wire,

	lastSequencer:null,

	receiver: null,
	selector: null,
	square: null,

	initialize: function()
	{
		this.parent( ColorWire.NAME );
	},

	init: function()
	{
		this.addCommand( CommandEventList.COLORDATA_LOAD,  ColorCommand );
		this.addCommand( CommandEventList.COLORDATA_UPDATED, ColorCommand );
		this.addCommand( CommandEventList.COLOR_CHANGE, ColorCommand );
		this.addCommand( CommandEventList.MOVEVIEW_MOVE, MoveViewCommand );

		var receiver = this.addView( ColorWire.NAME_RECEIVER, new ColorReceiver( "colorShell1" ) );
		receiver.addEventListener( ColorReceiver.TWEEN_SEQUENCE_EVENT, this.startTweenSequenceListener.bind( this ), false );

		var selector = this.addView( ColorWire.NAME_SELECTOR, new ColorSelector( "colorSelector" ) );
		selector.addEventListener( ColorSelector.EVENT_CLICKED_RANDOM, this.requestRandColorListener.bind(this), false );

		var square = this.addView( ColorWire.NAME_SQUARE, new ColorSquare( "colorSquare" ) );

		this.receiver = receiver;
		this.selector = selector;
		this.square = square;
		
		this.addModel( ColorModel.NAME, new ColorModel( null, null, this ) );
		
	},
	startTweenSequenceListener: function()
	{
		if( this.lastSequencer != null ) {
			this.lastSequencer.stop();
		}
		this.dispatchEvent( new ChainEvent( CommandEventList.TWEENSEQUENCE_SEQUENCE ) );
		this.lastSequencer = this.getLastSequencer();
	},

	loadColorData: function()
	{
		var model = this.getModel( ColorModel.NAME );
		model.loadData();
	},

	updateViews: function()
	{
		/** @type ColorVO **/
		var data = this.getModel(ColorModel.NAME).data;
		this.selector.updateColors( data );
		this.updateReceiverColor( data.color1 );
		this.updateSquareColor( data.color1 );
		d( data );
	},

	updateReceiverColor: function( color )
	{
		this.receiver.setColor( color );
	},

	updateSquareColor: function( color )
	{
		  this.square.setColor( color );
	},

	
	requestRandColorListener: function()
	{
		var m = this.getModel( ColorModel.NAME );
	    //this.fireEvent( CommandEventList.COLOR_CHANGE, m.getRandomColor() );
	    this.dispatchEvent( new ColorEvent( CommandEventList.COLOR_CHANGE, m.getRandomColor() ) );
	}
};
ColorWire.NAME = "Wire:Color";
ColorWire.NAME_RECEIVER = "View:Receiver";
ColorWire.NAME_SELECTOR = "View:Selector";
ColorWire.NAME_SQUARE = "View:Square";