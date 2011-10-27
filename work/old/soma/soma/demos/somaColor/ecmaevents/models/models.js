var ColorModel = new Class
({
	Extends: soma.core.model.Model,

	initialize: function()
	{
		this.parent( ColorModel.NAME, null, arguments[2] );	
	},

	init: function()
	{
			
	},

	getRandomColor: function()
	{
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.round(Math.random() * 15)];
		}
		return color;
	},
	loadData: function()
	{
		this.data = new ColorVO( this.getRandomColor(), this.getRandomColor(), this.getRandomColor() );
		this.dataComplete();
	},

	dataComplete: function()
	{
		this.dispatcher.dispatchEvent( new ColorEvent( CommandEventList.COLORDATA_UPDATED ) );
	},

	getColors: function()
	{
		return this.data;
	}
	
});
ColorModel.NAME = "Model.Color";

 /**
 * @author Henry Schmieder
 */


var ColorVO = new Class
({
	color1: null,
	color2: null,
	color3: null,
	
	initialize: function( color1, color2, color3 )
	{
		this.color1 = color1;
		this.color2 = color2;
		this.color3 = color3;
	}
});


var AsyncDelegate = new Class
({
	responder:null,

	initialize: function( responder )
	{
		if( responder.onFault == null || responder.onSuccess == null ) {
			throw new Error( "children of AsyncDelegate must implement onFault() and onSuccess()" );
		}
		this.responder = responder;

	},
	call: function()
	{
		console.log("AszyncDElegfate:: call");
		this.timerHandler.delay( 500, this );
	},
	/** @private **/
	timerHandler: function()
	{
		var result = Math.floor(Math.random() * 10 );
	    console.log( "tiomer handler", result, this.responder );
		if( result > 0 ) {
			this.responder.onSuccess( {id:"myData", data:"I'm a success"} );
		}else{
			this.responder.onFault({id:"myData", data:"I'm a fault"});
		}
	}
	
});