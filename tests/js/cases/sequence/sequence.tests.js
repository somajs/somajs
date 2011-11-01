/**
 * TODO implement the soma dispose method tp completely remove core players and regarding events
 * -- to assert create 2 instances of soma and check if instane one is still reacting on events by having somaEventsHandler reaction on trickling events
 */
var SequenceTest = new Class
({
	Extends: PyrTestCase

	,name: "SequenceTest"
	,soma: null
	,stage:null
	,asyncBound: null

	,initialize: function()
	{

	}

	,_should: {
		error: {
			"null"  : Error
		}
	}

	,setUp: function()
	{
		this.soma = new soma.core.Core();
		this.soma.addCommand( cases.sequence.InvocationCommandList.TEST, cases.sequence.TestAsyncCommand );
		this.soma.addCommand( cases.sequence.InvocationCommandList.TEST_SEQUENCE, cases.sequence.TestSequenceCommand );
		this.stage = this.soma.stage;
		this.asyncBound = this.asyncCommandSuccessHandler.bind(this);
	}

	,tearDown: function()
	{
		this.soma.stopAllSequencers();
		this.soma.dispose();
		this.soma = null;

	}

	,test_get_sequencer: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( InvocationCommandList.TEST_SEQUENCE  ) );
		this.wait();
	}

	,asyncCommandSuccessHandler: function()
	{
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.assertTrue( true );
		this.resume();

	}



});