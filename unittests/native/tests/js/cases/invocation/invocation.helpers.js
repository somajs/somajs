cases.invocation = {};

cases.invocation.InvocationCommandList =
{
	 TEST: "cases.invocation.test"
	,PARALLEL: "cases.invocation.parallel"
};

cases.invocation.TestCommand = soma.Command.extend({
	execute: function( e )
	{
		switch( e.type )
		{
			case cases.invocation.InvocationCommandList.TEST :
				var suite = e.params;
				suite.setToExecuted();
				break;
		}
	}
});

cases.invocation.TestParallelCommand = soma.ParallelCommand.extend({
	initializeSubCommands: function()
	{
		this.addSubCommand( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this.getData()) );
		this.addSubCommand( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this.getData()) );
	}
	,getData: function()
	{
		return this.getModel( cases.invocation.EmptyModel.NAME ).data;
	}
 });

cases.invocation.EmptyModel = soma.Model.extend({
	constructor: function( data )
	{
		soma.Model.call(this,  cases.invocation.EmptyModel.NAME,  data );
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
cases.invocation.EmptyModel.NAME = "cases.invocation.EmptyModel";


cases.invocation.TestEvent = soma.Event.extend({});









