cases.core = {};
cases.core.globalModelTestDisposeCalled = false;
cases.core.globalWireTestDisposeCalled = false;

cases.core.StartCommand = soma.core.controller.Command.extend({
	execute: function()
	{
		//testlog("startcommand exec");
	}
});

cases.core.CommandAssertInstance = soma.core.controller.Command.extend({
	execute: function(event)
	{
		event.params.test_case.assertNotNull(this.instance);
	}
});


cases.core.NativePrototypeCommand = soma.core.controller.Command.extend({
	execute: function()
	{
		testlog("startcommand exec");
	}
});


cases.core.TestView = soma.View.extend({
	scopeConfirmed: false,
	shouldAutobind:true,
	scope:null,
	init: function()
	{
		if( this.domElement ) {
		 	this.domElement.setAttribute("id", "testViewSprite" );
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


cases.core.TestWire = soma.core.wire.Wire.extend({
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



cases.core.TestAutobindWire = soma.core.wire.Wire.extend({
	AutoBindPattern:"customBoundMethod"

	,scopeConfirmed: false

	,storedEvent: null

	,invocationCount:0

	,scopeConfirmedThroughCustom:false

	,shouldAutobind: true

	,testListener: function( event )
	{
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


cases.core.TestModel = new soma.core.model.Model.extend({
	initCalled: false
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









