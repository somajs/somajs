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

	,asyncBound: null

	,skipDispose:false

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
		this.spriteTestAccess.addEventListener( InvocationCommandList.TEST,  this.setUserAccessFromDisplayListBound );
		this.soma = new soma.core.Core();
		this.soma.addEventListener( InvocationCommandList.TEST, this.setUserAccessFromInstanceBound );
		this.body = this.soma.body;
		this.soma.addCommand( InvocationCommandList.TEST, TestCommand );



	}

	,tearDown: function()
	{
		this.spriteTestAccess.removeEventListener( InvocationCommandList.TEST, this.setUserAccessFromDisplayListBound );
		this.soma.removeEventListener( InvocationCommandList.TEST, this.setUserAccessFromInstanceBound );
		this.soma.removeCommand( InvocationCommandList.TEST, TestCommand );
		//this.soma.stopAllSequencers();
		this.soma.dispose();
		this.soma = null;
	}


	,test_command_from_displayList: function()
	{
		this.spriteTestAccess.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this ) );
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
		this.spriteTestAccess.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}



	,test_command_from_instance: function()
	{
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertTrue( this.executed );
	}



	,test_command_from_instance_bubbles_false: function()
	{
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}


	,test_command_from_body: function()
	{
		this.body.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertTrue( this.executed );
	}

	,test_command_from_body_bubbles_false: function()
	{
		this.body.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, false ) );
		var f = this.defaultCheck();
		if( f !== null )  {
			this.fail( f );
		}
		this.assertFalse( this.executed );
	}

	,test_cancel_event_dispatched_from_instance: function()
	{
		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this ) );
		this.assertFalse( this.executed );
		this.soma.removeEventListener(  InvocationCommandList.TEST, this.cancelEventBound );
	}


	,test_cannot_cancel_event_dispatched_from_instance: function()
	{
		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, true, false ) );
		this.assertTrue( this.executed );
		this.soma.removeEventListener(  InvocationCommandList.TEST, this.cancelEventBound );

	}

	,test_cancel_event_dispatched_from_displaylist: function()
	{
		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.spriteTestAccess.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this ) );
		this.assertFalse( this.executed );
		this.soma.removeEventListener( InvocationCommandList.TEST, this.cancelEventBound );
	}

	,test_cannot_cancel_event_dispatched_from_displaylist: function()
	{
		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.spriteTestAccess.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, true, false ) );
		this.assertTrue( this.executed );
		// TODO check via hasEventListener if sprite has Listener cancelEventBound
		this.soma.removeEventListener( InvocationCommandList.TEST, this.cancelEventBound );
	}


	,test_cancel_event_dispatched_from_body: function()
	{
		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.body.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this )  );
		this.assertFalse( this.executed );
   		this.soma.removeEventListener( InvocationCommandList.TEST, this.cancelEventBound );
	}

	,test_cannot_cancel_event_dispatched_from_body: function()
	{
 		this.soma.addEventListener( InvocationCommandList.TEST, this.cancelEventBound );
		this.body.dispatchEvent( new TestEvent( InvocationCommandList.TEST, this, true, false )  );
		this.assertTrue( this.executed );
   		this.soma.removeEventListener( InvocationCommandList.TEST, this.cancelEventBound );
	}


	,test_parallel_command: function()
	{
		this.soma.dispose();
		this.soma = new soma.core.Core();

		this.soma.addCommand( InvocationCommandList.TEST, TestCommand );
		this.soma.addCommand( InvocationCommandList.PARALLEL, TestParallelCommand );
		this.soma.addModel( EmptyModel.NAME, new EmptyModel( this ) );
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.PARALLEL ) );
		this.assertEquals( this.executedCount, 5 );
	}

	,test_async_command: function()
	{
		this.soma.dispose();
		this.soma = new soma.core.Core();
		this.soma.addCommand( InvocationCommandList.TEST, TestAsyncCommand );
		this.asyncBound = this.asyncCommandSuccessHandler.bind(this);
		this.soma.addEventListener( InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.soma.dispatchEvent( new TestEvent( InvocationCommandList.TEST ) );
		this.skipDispose = true;
		this.wait();
	}

	/*
	,_test_async_command_fail: function()
	{
		//fail("AsyncCommand has not been executed under 500ms");
	}
    */

	,asyncCommandSuccessHandler: function()
	{
		this.soma.removeEventListener( InvocationCommandList.TEST_ASYNC_COMPLETE, this.asyncBound );
		this.assertTrue( true );
		this.resume();

	}



	 ,setToExecuted: function()
	{
		this.executedCount++;
		this.executed = true;
	}

	,setUserAccessFromDisplayList: function( e )
	{
		d("setUserAccessFromDisplayList");
		this.userAccessFromDisplayList = true;
	}

	,setUserAccessFromInstance: function( e )
	{
		d("setUserAccessFromInstance");
		this.userAccessFromInstance = true;
		this.userAccessFromInstanceCount++;
	}

	,cancelEvent: function( e )
	{
 		d("cancelEvent");
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



