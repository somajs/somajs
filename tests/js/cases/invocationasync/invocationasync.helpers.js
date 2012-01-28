cases.invocationasync = {};

cases.invocationasync.InvocationCommandList =
{
	 TEST: "cases.invocationasync.test"
	,TEST_ASYNC_COMPLETE: "cases.invocationasync.testAsyncComplete"
	,TEST_SEQUENCE_COMPLETE: "cases.invocationasync.testSequenceComplete"
};

cases.invocationasync.TestEvent = soma.Event.extend({});

cases.invocationasync.TestAsyncCommand = soma.core.controller.Command.extend({
	sequencer:null
	,timer:null

	,execute: function( event )
	{
		this.timer = setTimeout( this.result.bind(this), 300, {} );
	}
	,result: function(data)
	{
		this.dispatchEvent(new cases.invocationasync.TestEvent( cases.invocationasync.InvocationCommandList.TEST_ASYNC_COMPLETE, this.event ) );
	}
	,dispose: function()
	{
		clearTimeout( this.timer );
	}

 });