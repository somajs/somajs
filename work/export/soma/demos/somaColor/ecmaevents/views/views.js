/**
 * @author Henry Schmieder
 */

var ColorReceiver = new Class
({
	Extends:soma.View,

	panel:null,
	bg:null,
	

	initializeView: function()
	{
		this.panel = document.id("colorReceiver");
		this.bg = document.id("colorShellBg");
		document.id( "btnParallel").addEventListener( "click", this.chainListener.bind(this), false );
		document.id( "btnAsync").addEventListener( "click", this.asyncListener.bind(this), false );
		document.id( "btnSequence").addEventListener( "click", this.asyncChainListener.bind(this), false );
		document.id( "btnTweenSequence").addEventListener( "click", this.tweenSequenceListener.bind(this), false );
		document.id( "btnStopSequences").addEventListener( "click", this.stopAllSequencesListener.bind(this), false );
	},

	setColor: function( col )
	{
		this.bg.setStyle( "background-color", col );
		this.bg.set( "opacity", .3 );
	},

	updatePosition: function(x, y)
	{
		this.viewElement.setStyles({left:x, top:y});
	},

	chainListener: function()
	{
		//soma.core.EventProxy.send( CommandEventList.CHAIN_CHAIN );
		//this.fireEvent( CommandEventList.CHAIN_CHAIN );
		this.dispatchEvent( new soma.Event( CommandEventList.CHAIN_CHAIN ) );
	},
	
	asyncListener: function()
	{
		this.dispatchEvent( new soma.Event( CommandEventList.ASYNC_CALL ) );
	},

	asyncChainListener: function()
	{
		 this.dispatchEvent( new ChainEvent( CommandEventList.ASYNC_CHAIN ) );
	},

	tweenSequenceListener: function()
	{
		this.dispatchEvent( new ChainEvent( ColorReceiver.TWEEN_SEQUENCE_EVENT ) );
	},
	
	stopAllSequencesListener: function()
	{
		 //soma.core.EventProxy.send( CommandEventList.SEQUENCE_STOP_ALL )
		 //this.fireEvent( CommandEventList.SEQUENCE_STOP_ALL );
		this.dispatchEvent( new soma.Event( CommandEventList.SEQUENCE_STOP_ALL ) );
	}
});
ColorReceiver.TWEEN_SEQUENCE_EVENT = "startTweenSequenceEvent";


var ColorSelector = new Class
({
	Extends: soma.View,

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


	initializeView: function()
	{
		this.sprite1 = document.id("selCol1");
		this.sprite2 = document.id("selCol2");
		this.sprite3 = document.id("selCol3");

		this.btnCol1 = document.id("btnCol1");
		this.btnCol2 = document.id("btnCol2");
		this.btnCol3 = document.id("btnCol3");
		this.btnCol4 = document.id("btnCol4");

		this.sprite1.addEventListener( "click", this.clickedColListener.bind( this ), false );
		this.sprite2.addEventListener( "click", this.clickedColListener.bind( this ), false );
		this.sprite3.addEventListener( "click", this.clickedColListener.bind( this ), false );

		this.btnCol1.addEventListener( "click", this.clickedRandomColorListener.bind(this), false );
		this.btnCol2.addEventListener( "click", this.clickedMoveViewListener.bind(this), false );
		this.btnCol3.addEventListener( "click", this.clickedResetViewListener.bind(this), false );
		this.btnCol4.addEventListener( "click", this.clickedLoadDataListener.bind(this), false );

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
		var t = e.target;
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
		this.dispatchEvent( new ColorEvent( CommandEventList.COLOR_CHANGE, color ) );
	},
	clickedRandomColorListener: function()
	{
		this.dispatchEvent( new ColorEvent( ColorSelector.EVENT_CLICKED_RANDOM ) );
	},
	clickedMoveViewListener: function()
	{
		var newX = Math.round( Math.random() * 100 + 10 );
		var newY = Math.round( Math.random() * 100 + 10 );
		this.dispatchEvent( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [newX, newY] ) );
	},
	clickedResetViewListener: function()
	{
		this.dispatchEvent( new soma.Event( CommandEventList.SEQUENCE_STOP_ALL ) );
		this.dispatchEvent( new ColorEvent( CommandEventList.COLOR_CHANGE, this.color1 ) );
		this.dispatchEvent( new MoveEvent( CommandEventList.MOVEVIEW_MOVE, [0, 0] ) );
	},
	clickedLoadDataListener: function()
	{
		this.dispatchEvent( new ColorEvent( CommandEventList.COLORDATA_LOAD ) );
	}
});
ColorSelector.EVENT_CLICKED_RANDOM = "colorsel.random";




var ColorSquare = new Class
({
	Extends: soma.View,
	
	morph:null,

	setColor: function( col )
	{
		this.viewElement.setStyle( "background-color", col );
	}
});