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
	,sequenceflowTestDoneBound:null
	,stopSequencerHandlerBound:null
	,stopAllSequencersHandlerBound:null
	,stopSequencerWithEventHandlerBound: null
	,getRunningSequencersHandlerBound: null
	,isPartOfASequenceHandlerBound: null
	,getLastSequencerHandlerBound: null
	,sequenceHandlerBound:null
	,sequenceDoneBound:null
	,sCount:0

	,initialize: function()
	{
		this.asyncBound = this.asyncCommandSuccessHandler.bind(this);
		this.sequenceflowTestDoneBound = this.sequenceFlowTestDoneHandler.bind(this);
		this.stopSequencerWithEventHandlerBound = this.stopSequencerWithEventHandler.bind(this);
		this.stopSequencerHandlerBound = this.stopSequencerHandler.bind(this);
		this.stopAllSequencersHandlerBound = this.stopAllSequencersHandler.bind(this);
		this.getRunningSequencersHandlerBound = this.getRunningSequencersHandler.bind(this);
		this.isPartOfASequenceHandlerBound = this.isPartOfASequenceHandler.bind(this);
		this.getLastSequencerHandlerBound = this.getLastSequencerHandler.bind(this);
		this.sequenceHandlerBound = this.sequenceHandler.bind(this);
		this.sequenceDoneBound = this.sequenceDoneHandler.bind(this);
	}

	,_should: {
		error: {
			"null"  : Error
		}
	}

	,setUp: function()
	{
		this.soma = new soma.core.Application();
		this.soma.addCommand( cases.sequence.InvocationCommandList.TEST_ASYNC, cases.sequence.AsyncCommand );
		this.soma.addCommand( cases.sequence.InvocationCommandList.TEST_SEQUENCE, cases.sequence.SequenceCommand );
		this.sCount = 0;
		this.stage = this.soma.stage;

	}

	,tearDown: function()
	{
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.sequenceflowTestDoneBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopSequencerWithEventHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopSequencerHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopAllSequencersHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.getRunningSequencersHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.isPartOfASequenceHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.getLastSequencerHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.sequenceHandlerBound );
		this.soma.removeEventListener( cases.sequence.InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.sequenceDoneBound );
		this.soma.stopAllSequencers();
		this.soma.dispose();
		this.soma = null;
	}

	,test_sequencer_flow: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.sequenceflowTestDoneBound );
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE  ) );
		this.wait();
	}


	,test_stop_sequencer_with_event: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopSequencerWithEventHandlerBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE  ) );
		this.wait();
	}

	,test_stop_sequencer: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopSequencerHandlerBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}


	,test_stop_all_sequencers: function()
	{
	 	this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.stopAllSequencersHandlerBound );
	    this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}


	,test_get_running_sequencers: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.getRunningSequencersHandlerBound );
		this.soma.dispatchEvent(new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}


	,test_is_part_of_a_sequence: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.isPartOfASequenceHandlerBound );
		this.soma.dispatchEvent(new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}

	,test_get_last_sequencer: function()
	{
   		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.getLastSequencerHandlerBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}

	,test_sequence: function()
	{
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.sequenceHandlerBound );
		this.soma.addEventListener( cases.sequence.InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.sequenceDoneBound );
		this.soma.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE ) );
		this.wait();
	}


	,asyncCommandSuccessHandler: function( event )
	{
		var originalEvent = event.data;
		this.assertInstanceOf( Event, originalEvent );
		this.assertEquals( cases.sequence.InvocationCommandList.TEST_ASYNC, originalEvent.type );
		this.assertInstanceOf( cases.sequence.SequenceCommand, this.soma.getSequencer( originalEvent ) );
		this.assertTrue( this.soma.isPartOfASequence( originalEvent ) );
		//testlog( "asyncCommandSuccessHandler" );
	}

	,sequenceFlowTestDoneHandler: function( event )
	{
		var originalEvent = event.data;
		this.assertInstanceOf( Event, originalEvent );
		this.assertEquals( cases.sequence.InvocationCommandList.TEST_ASYNC, originalEvent.type );
		this.assertTrue( true );
		this.resume();

	}

	,stopSequencerWithEventHandler: function( event )
	{
		var originalEvent = event.data;
		var wasStopped = this.soma.stopSequencerWithEvent( originalEvent );
		this.assertTrue( wasStopped );
		this.assertNull( this.soma.getSequencer( originalEvent ) );
		this.resume();
	}

	,stopSequencerHandler: function( event )
	{
		var originalEvent = event.data;
		var sequencer = this.soma.getSequencer( originalEvent );
		var wasStopped = sequencer.stop();
		this.assertTrue( wasStopped );
		this.resume();
	}


	,stopAllSequencersHandler: function( event )
	{
	  	this.soma.stopAllSequencers();
		var originalEvent = event.data;
		var sequencer = this.soma.getSequencer( originalEvent );
	    var array = this.soma.getRunningSequencers();
		this.assertEquals( 0, array.length );
		this.assertNull( sequencer );
		this.resume();
	}

	,getRunningSequencersHandler: function( event )
	{
		var sequencers = this.soma.getRunningSequencers();
		this.assertEquals( 1, sequencers.length );
		this.resume();

	}

	,isPartOfASequenceHandler: function( event )
	{
		this.assertTrue( this.soma.isPartOfASequence( event.data ) );
		this.resume();
	}

	,getLastSequencerHandler: function( event )
	{
		this.assertInstanceOf( cases.sequence.SequenceCommand, this.soma.getLastSequencer() );
		this.resume();
	}

	,sequenceHandler: function( event )
	{
		++this.sCount;
		//testlog("sequence step: ",this.sCount );
	}

	,sequenceDoneHandler: function( event )
	{
   		this.assertEquals( 5, this.sCount );
		this.resume();
	}

});