cases.core = {};


cases.core.CommandList =
{
	 TEST: "cases.core.test"
};


cases.core.StartCommand = new Class
({
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
});


cases.core.NativePrototypeCommand = function(){};
cases.core.NativePrototypeCommand.prototype =
{
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
};


cases.core.TestView = new Class
({
	Implements:[Events]

	,el:null

	,initialize: function()
	{
		this.el = document.id("testSprite");
	}
	,init: function()
	{
		this.el.setStyles( {width:100, height:100, background:"#ccc"} );
	}
});
cases.core.TestView.NAME = "cases.core.TestView";


cases.core.TestWire = new Class
({
   	Extends: soma.core.wire.Wire,

	initCalled: false,

	init: function()
	{
		this.initCalled = true;
	}
});
cases.core.TestWire.NAME = "cases.core.TestWire";



cases.core.TestAutobindWire = new Class
({
   	Extends: soma.core.wire.Wire

	,scopeConfirmed: false

	,storedEvent:null

	,invocationCount:0

	,testListener: function( event )
	{
   		this.scopeConfirmed = true;
		this.storedEvent = event;
		this.invocationCount++;
	}

});
cases.core.TestAutobindWire.NAME = "cases.core.TestAutobindWire";




cases.core.TestModel = new Class
({
	Extends: soma.core.model.Model

	,initCalled: false

	,init: function()
	{
		this.initCalled = true;
	}
});
cases.core.TestModel.NAME  = "cases.core.TestModel";









