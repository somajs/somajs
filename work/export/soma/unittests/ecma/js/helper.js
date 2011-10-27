
var CommandEventList =
{
	STARTUP: "startup"
};


var InvocationCommandList =
{
	 TEST: "test"
	,PARALLEL: "parallel"
	,TEST_ASYNC_COMPLETE: "testAsyncComplete"
	,TEST_SEQUENCE_COMPLETE: "testSequenceComplete"
};



var TestCommand = new Class
({
	Extends: soma.core.controller.Command
	,execute: function( e )
	{
		switch( e.type )
		{
			case InvocationCommandList.TEST :
				var suite = e.data;
				suite.setToExecuted();
				d( "TestCommand::execute" );
				break;
		}
	}
});

var TestCommand2 = new Class
({
	Extends: soma.core.controller.Command
	,execute: function( e )
	{
		switch( e.type )
		{
			case InvocationCommandList.TEST :
				d( "TestCommand::execute" );
				break;
		}
	}
 });



var TestParallelCommand = new Class
({
	Extends: soma.core.controller.ParallelCommand
	,initializeSubCommands: function()
	{
		this.addSubCommand( new TestEvent( InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new TestEvent( InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new TestEvent( InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new TestEvent( InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new TestEvent( InvocationCommandList.TEST, this.getData()) );
	}
	,getData: function()
	{
		return this.getModel(EmptyModel.NAME).data;
	}
 });


var TestAsyncCommand = new Class
({
	Extends: soma.core.controller.Command

	,event:null
	,sequencer:null
	,timer:null

	,execute: function( event )
	{
		this.event = event;
		this.sequencer = this.getSequencer(event);
		this.timer = setTimeout( this.result.bind(this), 200, {});
	}
	,result: function(data)
	{
		var dispatchEndSequence = false;
		this.dispatchEvent(new TestEvent(InvocationCommandList.TEST_ASYNC_COMPLETE, this.event ) );
		if (this.isPartOfASequence(this.event)) {
			if (this.sequencer.length == 0) dispatchEndSequence = true;
			this.sequencer.executeNextCommand();
		}
		if (dispatchEndSequence) this.dispatchEvent(new TestEvent(InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.event));
		this.dispose();
	}

 });


var EmptyModel = new Class
({
	Extends: soma.core.model.Model

	,initialize: function( data )
	{
		this.parent( EmptyModel.NAME,  data );
	}
	 ,init: function()
	{
		this.dispatcher.dispatchEvent(new soma.Event("initialized"));
	}

	,dispose: function()
	{
		this.dispatcher.dispatchEvent(new soma.Event("disposed"));
	}

 });
EmptyModel.NAME = "model.empty";


var TestEvent = new Class
({
	Extends: soma.Event,

	initialize: function( type, data, bubbles, cancelable )
	{
		return this.parent( type, bubbles, cancelable, data );
	}
});





var StartCommand = new Class
({
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
});


var NativePrototypeCommand = function(){};
NativePrototypeCommand.prototype =
{
	Extends: soma.core.controller.Command,

	execute: function()
	{
		d("startcommand exec");
	}
};


var TestView = new Class
({
	Implements:[Events]

	,el:null

	,initialize: function()
	{
		this.el = document.id("testSprite");
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








