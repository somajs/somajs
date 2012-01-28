cases.sequence = {};

cases.sequence.InvocationCommandList =
{
	 TEST_SEQUENCE: "cases.sequence.sequence"
	,TEST_ASYNC: "cases.sequence.async"
	,TEST_ASYNC_COMPLETE: "cases.sequence.testAsyncComplete"
	,TEST_SEQUENCE_COMPLETE: "cases.sequence.testSequenceComplete"
};

cases.sequence.TestEvent = soma.Event.extend({});

cases.sequence.SequenceCommand = soma.core.controller.SequenceCommand.extend({
	constructor: function()
	{
		soma.core.controller.SequenceCommand.call(this, "cases.sequence.SequenceCommand");
	}
	,initializeSubCommands: function()
	{
		this.addSubCommand( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC ) );
		this.addSubCommand( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC ) );
		this.addSubCommand( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC ) );
		this.addSubCommand( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC ) );
		this.addSubCommand( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC ) );
	}
 });

cases.sequence.AsyncCommand = soma.core.controller.Command.extend({
	sequencer:null
	,timer:null
	,event:null
	,resultBound:null

	,execute: function( event )
	{
		this.event = event;
		this.sequencer = this.getSequencer(event);
		this.resultBound = this.result.bind(this);
		this.timer = setTimeout( this.resultBound, 100, {} );
	}
	,result: function( data )
	{
		if( !this.sequencer ) {
			return;
		}
		var dispatchEndSequence = false;

		this.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_ASYNC_COMPLETE, this.event ) );

		if (this.isPartOfASequence( this.event) ) {

			if (this.sequencer.getLength() == 0) {
				dispatchEndSequence = true;
			}else{
				this.sequencer.executeNextCommand();
			}
		}

		if (dispatchEndSequence) {
			this.dispatchEvent( new cases.sequence.TestEvent( cases.sequence.InvocationCommandList.TEST_SEQUENCE_COMPLETE, this.event ) );
		}
		this.dispose();
	}
	,dispose: function()
	{
		clearTimeout( this.timer );
		this.resultBound = null;
		this.sequencer = null;
		this.event = null;
	}

 });