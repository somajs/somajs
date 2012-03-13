cases.core = {};
cases.core.globalModelTestDisposeCalled = false;
cases.core.globalWireTestDisposeCalled = false;

cases.core.HandlerReceiver = soma.extend({
	received: false,
	handler: function() {
		this.received = true;
	}
});

cases.core.PluginExampleExtend = soma.extend({
	constructor: function(instance) {
		this.instance = instance;
		this.params = arguments;
	}
});

cases.core.PluginExampleNative = function(instance) {
	this.instance = instance;
	this.params = arguments;
};

cases.core.PluginExampleExtendChild = cases.core.PluginExampleExtend.extend({
	constructor: function(instance, param1) {
		cases.core.PluginExampleExtend.call(this, instance);
		this.param1 = param1;
	}
});

cases.core.StartCommand = soma.Command.extend({
	execute: function()
	{
		//testlog("startcommand exec");
	}
});

cases.core.CommandAssertInstance = soma.Command.extend({
	execute: function(event)
	{
		event.params.test_case.assertNotNull(this.instance);
	}
});


cases.core.NativePrototypeCommand = soma.Command.extend({
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


cases.core.TestWire = soma.Wire.extend({
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



cases.core.TestAutobindWire = soma.Wire.extend({
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


cases.core.TestModel = new soma.Model.extend({
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









