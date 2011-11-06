var CommandTest = new Class
({
	Extends: PyrTestCase

	,name: "CommandTest"

	,soma: null

	,_should: {
		error: {
			test_double_register_should_throw_Error: Error
			,test_register_nonCommand_should_throw_Error: Error
		}
	}

	,setUp: function()
	{
		this.soma = new soma.core.Core( document.getElementById( "somaInstanceElememnt" ) );
		this.soma.addCommand( CommandEventList.STARTUP, cases.core.StartCommand );
	}

	,tearDown: function()
	{
	   this.soma = null;
	}

	,test_StartCommand_is_registered : function ()
	{
		this.assertTrue( this.soma.hasCommand( CommandEventList.STARTUP ) );
	}

	,test_getCommand: function()
	{
		this.assertTrue( instanceOf( this.soma.getCommand( CommandEventList.STARTUP ), Class ) );
	}

	,test_removeCommand: function()
	{
		this.soma.removeCommand( CommandEventList.STARTUP );
		this.assertNull( this.soma.getCommand( CommandEventList.STARTUP ) );
	}

	,test_commandsLength: function()
	{
		this.assertEquals( this.soma.getCommands().length, 1 );
	}

	,test_add_prototypical_command: function()
	{
		this.soma.addCommand( "commandPrototype", cases.core.NativePrototypeCommand );
		this.assertTrue( this.soma.hasCommand( "commandPrototype" ) );
	}

	/**
	 * Expects Error see - _should
	 */
	,test_double_register_should_throw_Error: function()
	{
		this.soma.addCommand( CommandEventList.STARTUP, cases.core.StartCommand );
	}

	/**
	 * Expects Error see - _should
	 */
	/*
	,test_register_nonCommand_should_throw_Error: function()
	{
		this.soma.addCommand( "testcommandinvalidtype", {} );
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
		this.soma = new soma.core.Core( document.getElementById( "somaInstanceElememnt" ) );
	}

	,tearDown: function()
	{
		this.soma.dispose();
		this.soma = null;
	}

	,test_init_App_Get_Views_Should_Give_EmptyObject: function()
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

	,test_has_View_after_registerView: function()
	{
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.assertTrue( this.soma.hasView( cases.core.TestView.NAME ) );
	}

	,test_get_View_after_registerView: function()
	{
	 	this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.assertInstanceOf(  cases.core.TestView, this.soma.getView( cases.core.TestView.NAME ) );
	}

	,test_viewsLength_after_registerView: function()
	{
	   this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
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
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
	}

	,test_register_calls_init: function()
	{
	 	this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.assertTrue( document.id("testSprite").getStyle("background-color") == "#cccccc" );
	}


	,test_addView_and_removeView_shouldGive_null_For_GetView: function()
	{
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.soma.removeView( cases.core.TestView.NAME );
		this.assertNull( this.soma.getView(cases.core.TestView.NAME) );
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
		this.soma = new soma.core.Core( document.getElementById( "somaInstanceElememnt" ) );
	}
	,tearDown: function()
	{
		this.soma.dispose();
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
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.assertTrue( this.soma.hasWire( cases.core.TestWire.NAME ) );
	}

	,test_getWire_after_registerWire: function()
	{
	 	this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.assertInstanceOf(  cases.core.TestWire, this.soma.getWire( cases.core.TestWire.NAME ) );
	}

	,test_wiresLength_after_registerWire: function()
	{
	   this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
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
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
	}

	,test_register_calls_init: function()
	{
	 	this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		var wire = this.soma.getWire( cases.core.TestWire.NAME );
		this.assertTrue( wire.initCalled );
	}


	,test_addWire_and_removeWire_shouldGive_null_For_GetWire: function()
	{
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.soma.removeWire( cases.core.TestWire.NAME );
		this.assertNull( this.soma.getWire( cases.core.TestWire.NAME ) );
	}


});


var ModelTest = new Class
({
	Extends: PyrTestCase

	,name: "ModelTest"

	,soma: null


	,setUp: function()
	{
		this.soma = new soma.core.Core( document.getElementById( "somaInstanceElememnt" ) );
	}
	,tearDown: function()
	{
		this.soma.dispose();
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
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.assertTrue( this.soma.hasModel( cases.core.TestModel.NAME ) );
	}

	,test_GetModel_after_registerModel: function()
	{
	 	this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.assertInstanceOf(  cases.core.TestModel, this.soma.getModel( cases.core.TestModel.NAME ) );
	}

	,test_modelsLength_after_registerModel: function()
	{
	   this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
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
		this.soma.addView( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.soma.addView( cases.core.TestModel.NAME, new cases.core.TestModel() );
	}

	,test_register_calls_init: function()
	{
	 	this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		var model = this.soma.getModel( cases.core.TestModel.NAME );
		this.assertTrue( model.initCalled );
	}



	,test_addModel_and_removeModel_shouldGive_null_For_GetModel: function()
	{
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.soma.removeModel( cases.core.TestModel.NAME );
		this.assertNull( this.soma.getModel( cases.core.TestModel.NAME ));
	}



});





