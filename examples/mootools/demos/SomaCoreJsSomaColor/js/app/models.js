var ColorModel = soma.Model.extend({
	constructor: function()
	{
		soma.Model.call(this, ColorModel.NAME, null, arguments[2]);
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

var ColorVO = function(color1, color2, color3) {
	this.color1 = color1;
	this.color2 = color2;
	this.color3 = color3;
};
ColorVO.prototype = {
	color1: null,
	color2: null,
	color3: null
};


var AsyncDelegate = function(responder) {
	if( responder.onFault == null || responder.onSuccess == null ) {
		throw new Error( "children of AsyncDelegate must implement onFault() and onSuccess()" );
	}
	this.responder = responder;
};
AsyncDelegate.prototype = {
	responder:null,
	call: function()
	{
		console.log("AsyncDelgate:: call");
        setTimeout( this.timerHandler.bind(this), 500 );
	},
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
};