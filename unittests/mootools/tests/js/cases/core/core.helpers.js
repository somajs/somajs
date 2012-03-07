cases.core = {};
cases.core.globalModelTestDisposeCalled = false;
cases.core.globalWireTestDisposeCalled = false;

cases.core.PluginExampleExtend = new Class({
	initialize: function(instance) {
		this.instance = instance;
		this.params = arguments;
	}
});

cases.core.PluginExampleNative = function(instance) {
	this.instance = instance;
	this.params = arguments;
}

cases.core.PluginExampleExtendChild = new Class({
	Extends: cases.core.PluginExampleExtend,
	initialize: function(instance, param1) {
		this.parent(instance);
		this.param1 = param1;
	}
});

cases.core.StartCommand = new Class
({
	Extends: soma.Command,

	execute: function()
	{
		//testlog("startcommand exec");
	}
});

cases.core.CommandAssertInstance = new Class
({
	Extends: soma.Command,

	execute: function(event)
	{
		event.params.test_case.assertNotNull(this.instance);
	}
});


cases.core.NativePrototypeCommand = function(){};
cases.core.NativePrototypeCommand.prototype =
{
	Extends: soma.Command,

	execute: function()
	{
		testlog("startcommand exec");
	}
};


cases.core.TestView = new Class
({
	Extends: soma.View,

	scopeConfirmed: false,

	shouldAutobind:true,

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
   	Extends: soma.Wire,

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
   	Extends: soma.Wire

	,AutoBindPattern:"customBoundMethod"

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


cases.core.TestModel = new Class
({
	Extends: soma.Model

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









