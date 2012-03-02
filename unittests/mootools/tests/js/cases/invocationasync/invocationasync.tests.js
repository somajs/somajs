/**
 * TODO implement the soma dispose method tp completely remove core players and regarding events
 * -- to assert create 2 instances of soma and check if instane one is still reacting on events by having somaEventsHandler reaction on trickling events
 */
InvocationAsyncTest = new Class
({
	Extends: PyrTestCase

	,name: "InvocationAsyncTest"

	 /**
	  * @type soma.Application
	  */
	,soma:null

	,asyncBound: null

	,initialize: function()
	{
		this.asyncBound = this.asyncCommandSuccessHandler.bind( this );
	}

	,setUp: function()
	{
		this.soma = new soma.Application();
		this.soma.addCommand( cases.invocationasync.InvocationCommandList.TEST, cases.invocationasync.TestAsyncCommand );
		this.soma.addEventListener( cases.invocationasync.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
	}

	,tearDown: function()
	{
		this.soma.removeEventListener( cases.invocationasync.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.soma.dispose();
	}

	,test_async_command: function()
	{
		//testlog("test_async_command");
		this.soma.dispatchEvent( new cases.invocationasync.TestEvent( cases.invocationasync.InvocationCommandList.TEST ) );
		this.wait();
	}

	,_test_async_command_fail: function()
	{
		//fail("AsyncCommand has not been executed under 500ms");
	}


	,asyncCommandSuccessHandler: function()
	{
		//testlog("asyncCommandSuccessHandler");
		this.assertTrue( true );
		this.resume();

	}


});