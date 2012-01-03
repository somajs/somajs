var InvocationTest = new Class
({
	Extends: PyrTestCase

	,name: "InvocationTest"

	,soma: null

	,body:null

	,somaViewTestObj: null

	,domtreeTestNode: null

	,spriteTestAccess:null

	,executed: false

	,executedCount: 0

	,userAccessFromInstance: false

	,userAccessFromInstanceCount:0

	,userAccessFromDisplayList: false

	,setUserAccessFromDisplayListBound:null

	,setUserAccessFromInstanceBound: null

	,cancelEventBound: null



	,initialize: function()
	{
		this.cancelEventBound = this.cancelEvent.bind( this );
		this.setUserAccessFromDisplayListBound =  this.setUserAccessFromDisplayList.bind( this );
		this.setUserAccessFromInstanceBound = this.setUserAccessFromInstance.bind( this );
	}

	,_should: {
		error: {
			test_multiple_register_of_same_view_should_throw_Error: Error
			,test_command_from_body_should_fail: Error
		}
	}

	,setUp: function()
	{
		this.executed = false;
		this.executedCount = 0;
		this.userAccessFromInstanceCount = 0;
		this.userAccessFromDisplayList = false;
		this.userAccessFromInstance = false;

		this.spriteTestAccess = document.getElementById( "testSprite" );
		if( this.spriteTestAccess.addEventListener ) {
           this.spriteTestAccess.addEventListener( cases.invocation.InvocationCommandList.TEST,  this.setUserAccessFromDisplayListBound, false );
        }else{
           // TODO IE implement
        }

		this.soma = new soma.core.Application();
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.setUserAccessFromInstanceBound );
		this.body = this.soma.body;
		this.soma.addCommand( cases.invocation.InvocationCommandList.TEST, cases.invocation.TestCommand );



	}

	,tearDown: function()
	{
		if( this.spriteTestAccess.removeEventListener ) {
            this.spriteTestAccess.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.setUserAccessFromDisplayListBound, false );
        }else{
           // TODO IE implement
        }
        this.soma.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.setUserAccessFromInstanceBound, false );
		this.soma.removeCommand( cases.invocation.InvocationCommandList.TEST, cases.invocation.TestCommand );
		this.soma.dispose();
		this.soma = null;
	}


	,test_command_from_displayList: function()
	{
		this.spriteTestAccess.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertTrue( this.executed );
	}



	 /**
	  * the display list dispatches, the framework catches, dispatches a clone and gives the opportunity to wires to
	  * "prevent default" the commandthe display list dispatches, the framework catches,
	  * dispatches a clone and gives the opportunity to wires to "prevent default" the command
	  */
	,test_command_from_displayList_bubbles_false: function()
	{
		this.spriteTestAccess.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}



	,test_command_from_instance: function()
	{
		this.soma.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertTrue( this.executed );
	}



	,test_command_from_instance_bubbles_false: function()
	{
		this.soma.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}


	,test_command_from_body: function()
	{
		this.body.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertTrue( this.executed );
	}

	,test_command_from_body_bubbles_false: function()
	{
		this.body.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}

	,test_cancel_event_dispatched_from_instance: function()
	{
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.soma.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, true, true ) );
		this.assertFalse( this.executed );
		this.soma.removeEventListener(  cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
	}

	,test_cannot_cancel_event_dispatched_from_instance: function()
	{
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.soma.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, true, false ) );
		this.assertTrue( this.executed );
		this.soma.removeEventListener(  cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );

	}

	,test_cancel_event_dispatched_from_displaylist: function()
	{
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.spriteTestAccess.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, false, true ) );
		this.assertFalse( this.executed );
		this.soma.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
	}

	,test_cannot_cancel_event_dispatched_from_displaylist: function()
	{
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.spriteTestAccess.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, true, false ) );
		this.assertTrue( this.executed );
		this.soma.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
	}


	,test_cancel_event_dispatched_from_body: function()
	{
		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.body.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, false, true )  );
		this.assertFalse( this.executed );
   		this.soma.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
	}

    // TODO IE7
	,test_cannot_cancel_event_dispatched_from_body: function()
	{
 		this.soma.addEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
		this.body.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.TEST, this, true, false )  );
		this.assertTrue( this.executed );
   		this.soma.removeEventListener( cases.invocation.InvocationCommandList.TEST, this.cancelEventBound );
	}


	,test_parallel_command: function()
	{
		this.soma.dispose();
		this.soma = new soma.core.Application();

		this.soma.addCommand( cases.invocation.InvocationCommandList.TEST, cases.invocation.TestCommand );
		this.soma.addCommand( cases.invocation.InvocationCommandList.PARALLEL, cases.invocation.TestParallelCommand );
		this.soma.addModel( cases.invocation.EmptyModel.NAME, new cases.invocation.EmptyModel( this ) );
		this.soma.dispatchEvent( new cases.invocation.TestEvent( cases.invocation.InvocationCommandList.PARALLEL ) );
		this.assertEquals( this.executedCount, 5 );
	}

	 ,setToExecuted: function()
	{
		this.executedCount++;
		this.executed = true;
	}

	,setUserAccessFromDisplayList: function( e )
	{
		//testlog("setUserAccessFromDisplayList");
		this.userAccessFromDisplayList = true;
	}

	,setUserAccessFromInstance: function( e )
	{
		//testlog("setUserAccessFromInstance");
		this.userAccessFromInstance = true;
		this.userAccessFromInstanceCount++;
	}

	,cancelEvent: function( e )
	{
 		//testlog("cancelEvent");
		e.preventDefault();
	}

	,defaultCheck: function()
	{
		if ( this.executed && !this.userAccessFromInstance) return "User did not have access to the command from the framework";
		else if ( this.userAccessFromInstanceCount > 1) return "User had access to the command from the framework twice";
		else if ( this.executed && this.userAccessFromDisplayList) return "User had access to the command from the display list";
		else if ( this.executedCount > 1) return "Command has been executed twice";
		return null;
	}

});



