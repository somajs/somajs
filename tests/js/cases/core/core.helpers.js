cases.core = {};

cases.core.StartCommand = new Class
({
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
});

cases.core.CommandAssertInstance = new Class
({
	Extends: soma.core.controller.Command,

	execute: function(event)
	{
		event.test_case.assertNotNull(this.instance);
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
	Extends: soma.View,

	scopeConfirmed: false,

	init: function()
	{
		if( this.domElement ) {
		 	this.domElement.set("id", "testViewSprite" );
			this.domElement.setStyles( {width:"100px", height:"100px", background:"#ccc"} );
		}
	},
	dispose: function()
	{
		if( this.domElement && this.domElement != document.body ) {
			this.domElement.destroy();
		}
	},
	viewListener: function( event )
	{
		this.scopeConfirmed = true;
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

	,AutoBind:"customBoundMethod"

	 ,scopeConfirmed: false

	,storedEvent:null

	,invocationCount:0

	,scopeConfirmedThroughCustom:false

	,testListener: function( event )
	{
   		this.scopeConfirmed = true;
		this.storedEvent = event;
		this.invocationCount++;
	}

	,customBoundMethod: function()
	{
		this.scopeConfirmedThroughCustom = true;
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









