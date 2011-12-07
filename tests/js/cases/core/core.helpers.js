cases.core = {};
cases.core.globalModelTestDisposeCalled = false;
cases.core.globalWireTestDisposeCalled = false;

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

	autobind:true,

	scope:null,

	init: function()
	{
		if( this.domElement ) {
		 	this.domElement.setAttribute("id", "testViewSprite" );
			//this.domElement.setStyles( {width:"100px", height:"100px", background:"#ccc"} );
		}
	},
	dispose: function()
	{
		if( this.domElement && this.domElement != document.body ) {
			this.domElement = null;
		}
	},
	viewListener: function( event )
	{
		this.scopeConfirmed = true;
		cases.core.TestView.scope = this;
	}
});
cases.core.TestView.scope = null;


cases.core.TestView.NAME = "cases.core.TestView";


cases.core.TestWire = new Class
({
   	Extends: soma.core.wire.Wire,

	initCalled: false,

	init: function()
	{
		this.initCalled = true;
	}
	
	,dispose: function()
	{
		cases.core.globalWireTestDisposeCalled = true;
	}
});
cases.core.TestWire.NAME = "cases.core.TestWire";



cases.core.TestAutobindWire = new Class
({
   	Extends: soma.core.wire.Wire

	,AutoBindPattern:"customBoundMethod"

	,scopeConfirmed: false

	,storedEvent:null

	,invocationCount:0

	,scopeConfirmedThroughCustom:false

	,autobind: true

	,testListener: function( event )
	{
		alert(this)
   		this.scopeConfirmed = true;
		this.storedEvent = event;
		this.invocationCount++;
		cases.core.TestAutobindWire.scope = this;
	}

	,customBoundMethod: function()
	{
		this.scopeConfirmedThroughCustom = true;
	}

});
cases.core.TestAutobindWire.scope = null;
cases.core.TestAutobindWire.NAME = "cases.core.TestAutobindWire";


cases.core.TestModel = new Class
({
	Extends: soma.core.model.Model

	,initCalled: false
	,disposeCalled: false

	,init: function()
	{
		this.initCalled = true;
	}

	,dispose: function()
	{
		cases.core.globalModelTestDisposeCalled = true;
	}
});
cases.core.TestModel.NAME  = "cases.core.TestModel";









