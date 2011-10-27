
var CommandEventList =
{
	STARTUP: "startup"
};


var StartCommand = new Class
({
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
});


var TestView = new Class
({
	Implements:[Events]

	,el:null

	,initialize: function()
	{
		this.el = document.id("testNode");
	}
	,initializeView: function()
	{
		this.el.setStyles( {width:100, height:100, background:"#ccc"} );
	}

});


var TestWire = new Class
({
   	Extends: soma.core.wire.Wire,

	initCalled: false,

	init: function()
	{
		this.initCalled = true;	
	}
});
TestWire.NAME = "TestWire";


var TestModel = new Class
({
	Extends: soma.core.model.Model

	,initCalled: false
	
	,init: function()
	{
		this.initCalled = true;	
	}
});
TestModel.NAME  = "TestModel";








