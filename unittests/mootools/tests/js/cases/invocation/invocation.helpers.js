cases.invocation = {};

cases.invocation.InvocationCommandList =
{
	 TEST: "cases.invocation.test"
	,PARALLEL: "cases.invocation.parallel"
};



cases.invocation.TestCommand = new Class
({
	Extends: soma.Command
	,execute: function( e )
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


cases.invocation.TestParallelCommand = new Class
({
	Extends: soma.ParallelCommand
	,initializeSubCommands: function()
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


cases.invocation.EmptyModel = new Class
({
	Extends: soma.Model

	,initialize: function( data )
	{
		this.parent( cases.invocation.EmptyModel.NAME,  data );
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


cases.invocation.TestEvent = new Class
({
	Extends: soma.Event
});








