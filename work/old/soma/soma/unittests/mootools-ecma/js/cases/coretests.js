var CommandTest = new Class
({
	Extends: PyrTestCase,

	name: "CommandTest",

	soma: null,

	_should: {
		error: {
			test_double_register_should_throw_Error: Error
		}
	},

	setUp: function()
	{
		this.soma = new soma.core.Core();
		this.soma.addCommand( CommandEventList.STARTUP, StartCommand );
	},

	tearDown: function()
	{

	},

	test_StartCommand_is_registered : function ()
	{
		this.assertTrue( this.soma.hasCommand( CommandEventList.STARTUP ) );
	},

	test_getCommand: function()
	{
		this.assertTrue( instanceOf( this.soma.getCommand( CommandEventList.STARTUP ), Class ) );
	},

	test_removeCommand: function()
	{
		this.soma.removeCommand( CommandEventList.STARTUP );
		this.assertNull( this.soma.getCommand( CommandEventList.STARTUP ) );
	},

	test_commandsLength: function()
	{
		this.assertEquals( this.soma.getCommands().length, 1 );
	},

	/**
	 * Expects Error see - _should
	 */
	test_double_register_should_throw_Error: function()
	{
		this.soma.addCommand( CommandEventList.STARTUP, StartCommand );
	}

	/*
	testRegisterNonCommandShouldThrowError: function()
	{
		this.soma.addCommand( "testMappingNonCommandEventType", StartCommand );
	}
	*/



});



var ViewTest = new Class
({
	Extends: PyrTestCase

	,name:"ViewTest"

	,soma: null

	,_should: {
		error: {
			test_multiple_register_of_same_view_should_throw_Error: Error
		}
	}
	,setUp: function()
	{
	   this.soma = new soma.core.Core;
	}

	,tearDown: function()
	{
		//this.soma.dispose();   // TODO implement in source
		this.soma = null;
	}

	,test_initApp_GetViews_ShouldGive_EmptyObject: function()
	{
		this.assertTrue( typeof this.soma.getViews() == "object"  );
	}

	,test_initApp_shouldGive_ZeroLength: function()
	{
	 	var views = this.soma.getViews();
		var l = 0, i;
		for( i in views )
		{
			l++;
		}
		this.assertEquals( l, 0 );
	}

	,test_hasView_after_registerView: function()
	{
		this.soma.addView( "testView", new TestView() );
		this.assertTrue( this.soma.hasView( "testView" ) );
	}

	,test_getView_after_registerView: function()
	{
	 	this.soma.addView( "testView", new TestView() );
		this.assertInstanceOf(  TestView, this.soma.getView("testView") );
	}

	,test_viewsLength_after_registerView: function()
	{
	   this.soma.addView( "testView", new TestView() );
		var views = this.soma.getViews();
		var l = 0, i;
		for( i in views )
		{
			l++;
		}
		this.assertEquals( l, 1 );
	}

	,test_multiple_register_of_same_view_should_throw_Error: function()
	{
		this.soma.addView( "testView", new TestView() );
		this.soma.addView( "testView", new TestView() );
	}

	,test_register_calls_initializeView: function()
	{
	 	this.soma.addView( "testView", new TestView() );
		this.assertTrue( document.id("testNode").getStyle("background-color") == "#cccccc" );
	}


	,test_addView_and_removeView_shouldGive_null_For_GetView: function()
	{
		this.soma.addView( "testView", new TestView() );
		this.soma.removeView( "testView" );
		this.assertNull( this.soma.getView("testView") );
	}


});


var WireTest = new Class
({
	Extends: PyrTestCase

	,name: "WireTest"

	,soma: null

	,_should:  {
		error:  {
			test_multiple_register_of_same_wire_should_throw_Error: Error
		}
	}

	,setUp: function()
	{
		this.soma = new soma.core.Core();
	}
	,tearDown: function()
	{
		// this.soma.dispose(); // TODO implemnent in source
		this.soma = null;
	}

	,test_initApp_GetWires_ShouldGive_EmptyObject: function()
	{
		this.assertTypeOf( "object", this.soma.getWires() );
	}

	,test_initApp_shouldGive_ZeroLength: function()
	{
	 	var wires = this.soma.getWires();
		var l = 0, i;
		for( i in wires )
		{
			l++;
		}
		this.assertEquals( l, 0 );
	}

	,test_hasWire_after_registerWire: function()
	{
		this.soma.addWire( TestWire.NAME, new TestWire() );
		this.assertTrue( this.soma.hasWire( TestWire.NAME ) );
	}

	,test_getWire_after_registerWire: function()
	{
	 	this.soma.addWire( TestWire.NAME, new TestWire() );
		this.assertInstanceOf(  TestWire, this.soma.getWire( TestWire.NAME ) );
	}

	,test_wiresLength_after_registerWire: function()
	{
	   this.soma.addWire( TestWire.NAME, new TestWire() );
		var wires = this.soma.getWires();
		var l = 0, i;
		for( i in wires )
		{
			l++;
		}
		this.assertEquals( l, 1 );
	}

	,test_multiple_register_of_same_wire_should_throw_Error: function()
	{
		this.soma.addWire( TestWire.NAME, new TestWire() );
		this.soma.addWire( TestWire.NAME, new TestWire() );
	}

	,test_register_calls_init: function()
	{
	 	this.soma.addWire( TestWire.NAME, new TestWire() );
		var wire = this.soma.getWire( TestWire.NAME );
		this.assertTrue( wire.initCalled );
	}


	,test_addWire_and_removeWire_shouldGive_null_For_GetWire: function()
	{
		this.soma.addWire( TestWire.NAME, new TestWire() );
		this.soma.removeWire( TestWire.NAME );
		this.assertNull( this.soma.getWire( TestWire.NAME ) );
	}


});


var ModelTest = new Class
({
	Extends: PyrTestCase

	,name: "ModelTest"

	,soma: null
	
	,setUp: function()
	{
		this.soma = new soma.core.Core();
	}
	,tearDown: function()
	{
		//this.soma.dispose(); // TODO implement in source
		this.soma = null;
	}
	,_should: {
		error: {
			 test_multiple_register_of_same_model_should_throw_Error: Error
		}
	}
	,test_InitApp_GetModels_ShouldGive_EmptyObject: function()
	{
		this.assertTypeOf( "object", this.soma.getModels() );
	}

	,test_InitApp_shouldGive_ZeroLength: function()
	{
	 	var models = this.soma.getModels();
		var l = 0, i;
		for( i in models )
		{
			l++;
		}
		this.assertEquals( l, 0 );
	}

	,test_has_model_after_registerModel: function()
	{
		this.soma.addModel( TestModel.NAME, new TestModel() );
		this.assertTrue( this.soma.hasModel( TestModel.NAME ) );
	}

	,test_GetModel_after_registerModel: function()
	{
	 	this.soma.addModel( TestModel.NAME, new TestModel() );
		this.assertInstanceOf(  TestModel, this.soma.getModel( TestModel.NAME ) );
	}

	,test_modelsLength_after_registerModel: function()
	{
	   this.soma.addModel( TestModel.NAME, new TestModel() );
		var models = this.soma.getModels();
		var l = 0, i;
		for( i in models )
		{
			l++;
		}
		this.assertEquals( l, 1 );
	}

	,test_multiple_register_of_same_model_should_throw_Error: function()
	{
		this.soma.addView( TestModel.NAME, new TestModel() );
		this.soma.addView( TestModel.NAME, new TestModel() );
	}

	,test_register_calls_init: function()
	{
	 	this.soma.addModel( TestModel.NAME, new TestModel() );
		var model = this.soma.getModel( TestModel.NAME );
		this.assertTrue( model.initCalled );
	}



	,test_addModel_and_removeModel_shouldGive_null_For_GetModel: function()
	{
		this.soma.addModel( TestModel.NAME, new TestModel() );
		this.soma.removeModel( TestModel.NAME );
		this.assertNull( this.soma.getModel( TestModel.NAME ));
	}
	


});





