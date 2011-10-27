/**
 * @author Henry Schmieder
 */

var ColorReceiver = new Class
({
	Implements: [Events],

	el:null,
	panel:null,
	bg:null,
	
	initialize: function()
	{

	},
	initializeView: function()
	{
		this.el = document.id("colorShell1");
		this.panel = document.id("colorReceiver");
		this.bg = document.id("colorShellBg");
		document.id( "btnParallel").addEvent( "click", this.chainListener.bind(this) );
		document.id( "btnAsync").addEvent( "click", this.asyncListener.bind(this) );
		document.id( "btnSequence").addEvent( "click", this.asyncChainListener.bind(this) );
		document.id( "btnTweenSequence").addEvent( "click", this.tweenSequenceListener.bind(this) );
		document.id( "btnStopSequences").addEvent( "click", this.stopAllSequencesListener.bind(this) );
	},

	setColor: function( col )
	{
		this.bg.setStyle( "background-color", col );
		this.bg.set( "opacity", .3 );
	},

	updatePosition: function(x, y)
	{
		this.el.setStyles({left:x, top:y});	
	},

	chainListener: function()
	{
		//soma.core.EventProxy.send( CommandEventList.CHAIN_CHAIN );
		this.fireEvent( CommandEventList.CHAIN_CHAIN );
	},
	
	asyncListener: function()
	{
		//soma.core.EventProxy.send( CommandEventList.ASYNC_CALL );
		this.fireEvent( CommandEventList.ASYNC_CALL );
	},

	asyncChainListener: function()
	{
		 this.fireEvent( CommandEventList.ASYNC_CHAIN );
	},

	tweenSequenceListener: function()
	{
		this.fireEvent( ColorReceiver.TWEEN_SEQUENCE_EVENT );
	},
	
	stopAllSequencesListener: function()
	{
		 //soma.core.EventProxy.send( CommandEventList.SEQUENCE_STOP_ALL )
		 this.fireEvent( CommandEventList.SEQUENCE_STOP_ALL );
	}
});
ColorReceiver.TWEEN_SEQUENCE_EVENT = "startTweenSequenceEvent";


var ColorSelector = new Class
({
	Implements: [Events],

	el: null,
	
	sprite1:null,
	sprite2:null,
	sprite3:null,

	btnCol1:null,
	btnCol2:null,
	btnCol3:null,
	btnCol4:null,

	color1:null,
	color2:null,
	color3:null,

	initialize: function()
	{
		this.el = document.id( "colorSelector" );
		this.sprite1 = document.id("selCol1");
		this.sprite2 = document.id("selCol2");
		this.sprite3 = document.id("selCol3");

		this.btnCol1 = document.id("btnCol1");
		this.btnCol2 = document.id("btnCol2");
		this.btnCol3 = document.id("btnCol3");
		this.btnCol4 = document.id("btnCol4");

		this.sprite1.addEvent( "click", this.clickedColListener.bind( this ) );
		this.sprite2.addEvent( "click", this.clickedColListener.bind( this ) );
		this.sprite3.addEvent( "click", this.clickedColListener.bind( this ) );

		this.btnCol1.addEvent( "click", this.clickedRandomColorListener.bind(this) );
		this.btnCol2.addEvent( "click", this.clickedMoveViewListener.bind(this) );
		this.btnCol3.addEvent( "click", this.clickedResetViewListener.bind(this) );
		this.btnCol4.addEvent( "click", this.clickedLoadDataListener.bind(this) );

	},

	/**
	 *
	 * @param {ColorVO} data
	 */
	updateColors: function(data)
	{
		this.color1 = data.color1;
		this.color2 = data.color2;
		this.color3 = data.color3;

		this.updateSquares();
	},

	updateSquares: function()
	{
		this.sprite1.setStyle( "background-color", this.color1 );
		this.sprite2.setStyle( "background-color", this.color2 );
		this.sprite3.setStyle( "background-color", this.color3 );
	},

	
	clickedColListener: function(e)
	{
		var t = document.id( e.target );
		var color;
		switch( t )
		{
			case this.sprite1 :
				color = this.color1;
				break;
			
			case this.sprite2 :
				color = this.color2;
				break;

			case this.sprite3 :
				color = this.color3;
				break;
		}
		this.fireEvent( CommandEventList.COLOR_CHANGE, color );
	},
	clickedRandomColorListener: function()
	{
		this.fireEvent( ColorSelector.EVENT_CLICKED_RANDOM );
	},
	clickedMoveViewListener: function()
	{
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.fireEvent( CommandEventList.MOVEVIEW_MOVE, [newX, newY] );
	},
	clickedResetViewListener: function()
	{
		this.fireEvent( CommandEventList.SEQUENCE_STOP_ALL );
		this.fireEvent( CommandEventList.COLOR_CHANGE, this.color1 );
		this.fireEvent( CommandEventList.MOVEVIEW_MOVE, [0, 0] );
	},
	clickedLoadDataListener: function()
	{
		this.fireEvent( CommandEventList.COLORDATA_LOAD );
	}
});
ColorSelector.EVENT_CLICKED_RANDOM = "colorsel.random";




var ColorSquare = new Class
({
	Implements: [Events],

	el: null,
	morph:null,

	initialize: function()
	{
		this.el = document.id( "colorSquare" );
	},
	setColor: function( col )
	{
		this.el.setStyle( "background-color", col );
	}
});