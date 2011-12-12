var FacadeTests = new Class({

	Extends: PyrTestCase

	,name: "FacadeTests"
	,app: null

	,setUp: function() {
		this.app = new soma.core.Application;
	}

	,tearDown: function() {
		this.app.dispose();
		this.app = null;
	}

	,test_create_instance: function() {
		var soma1 = new soma.core.Application;
		var soma2 = new soma.core.Application;
		this.assertNotNull(soma1);
		this.assertNotNull(soma2);
		this.assertInstanceOf(soma.core.Application, soma1);
		this.assertInstanceOf(soma.core.Application, soma2);
		this.assertAreNotSame(soma1, soma2);
		this.assertAreNotSame(soma1.controller, soma2.controller);
		this.assertAreNotSame(soma1.wires, soma2.wires);
		this.assertAreNotSame(soma1.models, soma2.models);
		this.assertAreNotSame(soma1.views, soma2.views);
	}

	,test_component_creation: function() {
		this.assertNotNull(this.app.body);
		this.assertNotNull(this.app.wires);
		this.assertNotNull(this.app.controller);
		this.assertNotNull(this.app.wires);
		this.assertNotNull(this.app.models);
		this.assertNotNull(this.app.views);
	}

	,test_dispose: function() {
		var app = new soma.core.Application;
		app.addCommand(CommandEventList.STARTUP, cases.core.StartCommand);
		app.dispatchEvent(new soma.Event(CommandEventList.STARTUP));
		app.addWire(cases.core.TestWire.NAME, new cases.core.TestWire);
		app.addModel(cases.core.TestModel.NAME, new cases.core.TestModel);
		app.addView(cases.core.TestView.NAME, new cases.core.TestView);

		app.dispose();

		this.assertNull(app.body);
		this.assertNull(app.wires);
		this.assertNull(app.getWires());
		this.assertNull(app.getWire(cases.core.TestWire.NAME));
		this.assertNull(app.controller);
		this.assertNull(app.getCommands());
		this.assertNull(app.getCommand(CommandEventList.STARTUP));
		this.assertNull(app.models);
		this.assertNull(app.getModels());
		this.assertNull(app.getModel(cases.core.TestModel.NAME));
		this.assertNull(app.views);
		this.assertNull(app.getViews());
		this.assertNull(app.getView(cases.core.TestView.NAME));
		this.assertNull(app.getLastSequencer());
		this.assertNull(app.getRunningSequencers());
	}
	
	,test_packages_creation: function() {
		this.assertNotNull(soma);
		this.assertNotNull(soma.core);
		this.assertNotNull(soma.core.controller);
		this.assertNotNull(soma.core.model);
		this.assertNotNull(soma.core.view);
		this.assertNotNull(soma.core.wire);
		this.assertNotNull(soma.core.mediator);
		this.assertNotNull(soma.util);
	}

	,test_create_class_instance: function() {
		this.assertNotNull(soma.createClassInstance);
		var TestClass = new Class({});
		var instance = soma.createClassInstance(TestClass);
		this.assertNotNull(instance);
		this.assertInstanceOf(TestClass, instance);

	}

	,test_create_class_instance_from_prototype: function()
	{
   		this.assertNotNull(soma.createClassInstance);
   		var TestClass = function() {};
		TestClass.prototype = {
			p1: null,
			p2: null,
			initialize: function(p1, p2) {
				this.p1 = p1;
				this.p2 = p2;
			}
		};

		var instance = soma.createClassInstance( TestClass, "param1", "param2" );
		this.assertNotNull(instance);
		this.assertNotNull(instance.p1);
		this.assertNotNull(instance.p2);
		this.assertEquals(instance.p1, "param1");
		this.assertEquals(instance.p2, "param2");
	}


	,test_create_class_instance_from_Function: function()
	{
   		this.assertNotNull(soma.createClassInstance);
   		var TestClass = function()
		{
		    this.p1 = null,
			this.p2 = null,

			this.initialize = function(p1, p2) {
				this.p1 = p1;
				this.p2 = p2;
			}
	  	};


		var instance = soma.createClassInstance( TestClass, "param1", "param2" );
		this.assertNotNull(instance);
		this.assertNotNull(instance.p1);
		this.assertNotNull(instance.p2);
		this.assertEquals(instance.p1, "param1");
		this.assertEquals(instance.p2, "param2");
	}


	,test_create_class_instance_parameters: function() {
		this.assertNotNull(soma.createClassInstance);
		var TestClass = new Class({
			p1: null,
			p2: null,
			initialize: function(p1, p2) {
				this.p1 = p1;
				this.p2 = p2;
			}
		});

		var instance = soma.createClassInstance(TestClass, "param1", "param2");
		this.assertNotNull(instance);
		this.assertInstanceOf(TestClass, instance);
		this.assertNotNull(instance.p1);
		this.assertNotNull(instance.p2);
		this.assertEquals(instance.p1, "param1");
		this.assertEquals(instance.p2, "param2");
	}

});

var CommandTest = new Class
({
	Extends: PyrTestCase

	,name: "CommandTest"

	,soma: null

	,_should: {
		error: {
			test_double_register_should_throw_Error: Error
			,test_register_nonCommand_should_throw_Error: Error
			//,test_add_non_command_should_throw_error: Error
		}
	}

	,setUp: function()
	{
		this.soma = new soma.core.Application();
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

	,test_instance_is_set: function()
	{
		this.soma.addCommand( CommandEventList.TEST_INSTANCE, cases.core.CommandAssertInstance );
		this.soma.dispatchEvent( new soma.Event(CommandEventList.TEST_INSTANCE, {test_case:this}, true, false ) );
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
			,test_domelement_wrong_type_should_fail: Error
		}
	}


	,setUp: function()
	{
		this.soma = new soma.core.Application();
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
		var el = document.createElement("div");
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( el ) );
		this.assertTrue( this.soma.hasView( cases.core.TestView.NAME ) );
	}

	,test_get_View_after_registerView: function()
	{
	 	this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( document.createElement("div") ) );
		this.assertInstanceOf(  cases.core.TestView, this.soma.getView( cases.core.TestView.NAME ) );
	}

	,test_viewsLength_after_registerView: function()
	{
	   this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( document.createElement("div") ) );
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
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( document.createElement("div") ) );
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( document.createElement("div") ) );
	}

	,test_register_calls_init: function()
	{
		var view = new cases.core.TestView( document.createElement("div") );
	 	this.soma.addView( cases.core.TestView.NAME, view );

		this.assertTrue( view.domElement.getAttribute( "id" ) == "testViewSprite" );
	}


	,test_addView_and_removeView_shouldGive_null_For_GetView: function()
	{
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( document.createElement("div") ) );
		this.soma.removeView( cases.core.TestView.NAME );
		this.assertNull( this.soma.getView(cases.core.TestView.NAME) );
	}

	,test_domelement_wrong_type_should_fail: function()
	{
		this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( "myString" ) );
		this.soma.removeView( cases.core.TestView.NAME );

	}

	,test_domElement_null_defaults_to_body: function()
	{
		var view = this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView() );
		this.assertEquals( document.body, view.domElement );
	}


	,test_dispose: function()
	{
		var element = document.createElement("div");
		var view = this.soma.addView( cases.core.TestView.NAME, new cases.core.TestView( element ) );
		this.assertNotNull( view );
		this.assertEquals( "testViewSprite", view.domElement.getAttribute( "id" ) );
		this.soma.removeView( cases.core.TestView.NAME );
		this.assertNull( view.domElement );
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
		this.soma = new soma.core.Application();
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

	,test_get_name: function() {
		var name = "wire_name";
		this.soma.addWire( name, new cases.core.TestWire(name) );
		this.assertNotNull(this.soma.getWire(name).getName());
		this.assertEquals(this.soma.getWire(name).getName(), name);
	}

	,test_set_name: function() {
		var name = "new_name";
		this.soma.addWire( name, new cases.core.TestWire('wire_name') );
		this.assertNotNull(this.soma.getWire(name).getName());
		this.assertNotEquals(this.soma.getWire(name).getName(), name);
		this.soma.getWire(name).setName(name);
		this.assertNotNull(this.soma.getWire(name).getName());
		this.assertEquals(this.soma.getWire(name).getName(), name);
	}

	,test_instance_is_set: function() {
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.assertNotNull(this.soma.getWire(cases.core.TestWire.NAME).instance)
	}

	,test_dispose_called: function() {
		cases.core.globalWireTestDisposeCalled = false;
		this.soma.addWire( cases.core.TestWire.NAME, new cases.core.TestWire() );
		this.soma.getWire(cases.core.TestWire.NAME).dispose();
		this.assertTrue(cases.core.globalWireTestDisposeCalled);
		cases.core.globalWireTestDisposeCalled = false;
	}

});


var ModelTest = new Class
({
	Extends: PyrTestCase

	,name: "ModelTest"

	,soma: null


	,setUp: function()
	{
		this.soma = new soma.core.Application();
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

	,test_get_name: function() {
		var name = "model_name";
		this.soma.addModel( name, new cases.core.TestModel(name) );
		this.assertNotNull(this.soma.getModel(name).getName());
		this.assertEquals(this.soma.getModel(name).getName(), name);
	}

	,test_set_name: function() {
		var name = "new_name";
		this.soma.addModel( name, new cases.core.TestModel('model_name') );
		this.assertNotNull(this.soma.getModel(name).getName());
		this.assertNotEquals(this.soma.getModel(name).getName(), name);
		this.soma.getModel(name).setName(name);
		this.assertNotNull(this.soma.getModel(name).getName());
		this.assertEquals(this.soma.getModel(name).getName(), name);
	}

	,test_instance_is_set: function() {
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).instance)
	}

	,test_get_data: function() {
		var data = {sample:"data sample"};
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel(null, data) );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).data);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).data, data);
	}

	,test_set_data: function() {
		var data = {sample:"data sample"};
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel(null, {}) );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).data);
		this.assertNotEquals(this.soma.getModel(cases.core.TestModel.NAME).data, data);
		this.soma.getModel(cases.core.TestModel.NAME).data = data;
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).data);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).data, data);
	}

	,test_default_dispatcher: function() {
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).dispatcher);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).dispatcher, this.soma);
	}

	,test_get_dispatcher: function() {
		var dispatcher = new soma.EventDispatcher;
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel(null, null, dispatcher) );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).dispatcher);
		this.assertNotEquals(this.soma.getModel(cases.core.TestModel.NAME).dispatcher, this.soma);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).dispatcher, dispatcher);
	}

	,test_set_dispatcher: function() {
		var dispatcher = new soma.EventDispatcher;
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).dispatcher);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).dispatcher, this.soma);
		this.soma.getModel(cases.core.TestModel.NAME).dispatcher = dispatcher
		this.assertNotNull(this.soma.getModel(cases.core.TestModel.NAME).dispatcher);
		this.assertEquals(this.soma.getModel(cases.core.TestModel.NAME).dispatcher, dispatcher);
	}

	,test_dispose_called: function() {
		cases.core.globalModelTestDisposeCalled = false;
		this.soma.addModel( cases.core.TestModel.NAME, new cases.core.TestModel() );
		this.soma.getModel(cases.core.TestModel.NAME).dispose();
		this.assertTrue(cases.core.globalModelTestDisposeCalled);
		cases.core.globalModelTestDisposeCalled = false;
	}

});


var AutobindTest = new Class
({

	 Extends: PyrTestCase

	 ,Implements:[ soma.core.AutoBind ]

	,name: "AutobindTest"

	,soma: null

	,scopeConfirmed: false

	,listenerInvocation:0


	,initialize: function()
	{
		this.autobind();
		this.autobind();  // make sure following tests are not affected by double call of _somaAutobind
	}

	,setUp: function()
	{
		this.soma = new soma.core.Application();
		this.soma.addEventListener( "test", this.autoBoundListener );
	}

	,tearDown: function()
	{
   		this.soma.removeEventListener( "test", this.autoBoundListener );
		this.soma.removeWire( cases.core.TestAutobindWire.NAME );
		this.listenerInvocation = 0;
		this.scopeConfirmed = false;
		this.soma.dispose();
	}

	,test_custom_autobind_rule: function()
	{
		var wire = new cases.core.TestAutobindWire();
		this.soma.addWire( cases.core.TestAutobindWire.NAME, wire  );
		this.soma.removeEventListener( "test", this.autoBoundListener );
		this.soma.addEventListener( "test", wire.customBoundMethod );
		this.soma.dispatchEvent( new soma.Event("test") );
		this.soma.removeEventListener( "test", wire.customBoundMethod );
		this.assertTrue( wire.scopeConfirmedThroughCustom );

	}


	,test_first_listener_invocation: function()
	{
	   this.soma.dispatchEvent( new soma.Event("test") );
	   this.assertTrue( this.scopeConfirmed );
	}

	,test_second_listener_invocation: function()
	{
		this.soma.dispatchEvent( new soma.Event("test") );
		this.assertTrue( this.scopeConfirmed );
	}

	 ,test_wire_autobind_scope: function()
	{
		var wire = new cases.core.TestAutobindWire();
		this.soma.addWire( cases.core.TestAutobindWire.NAME, wire  );

		wire.addEventListener( "test", wire.testListener );
		this.soma.dispatchEvent( new soma.Event("test") );
		this.assertTrue( wire.scopeConfirmed );
		this.assertEquals( "test", wire.storedEvent.type );
		this.assertEquals( 1, wire.invocationCount );
		wire.invocationCount = 0;
		wire.removeEventListener( "test", wire.testListener );

		this.soma.dispatchEvent( new soma.Event("test") );
		this.assertEquals( 0, wire.invocationCount );

	}

	,test_wire_no_autobind: function()
	{
		var wire = new cases.core.TestAutobindWire();
		wire.shouldAutobind = false;
		this.soma.addWire( cases.core.TestAutobindWire.NAME, wire  );
		
		wire.addEventListener( "test", wire.testListener );
		this.soma.dispatchEvent( new soma.Event("test") );
		wire.removeEventListener( "test", wire.testListener );
		this.assertEquals( window, cases.core.TestAutobindWire.scope );
	}

	,test_view_autobind: function()
	{
		var sprite = document.createElement("div");
		document.body.appendChild( sprite );
		var view = new cases.core.TestView( sprite );
		this.soma.addView( "viewname", view );
		view.addEventListener( "testFromView", view.viewListener );
		view.dispatchEvent( new soma.Event("testFromView") );

		view.removeEventListener( "testFromView", view.viewListener );
		this.soma.removeView( "viewname" );
		this.assertTrue( view.scopeConfirmed  );
		cases.core.TestView.scope = null;

	}

	,test_view_no_autobind: function()
	{
		var sprite = document.createElement("div");
		document.body.appendChild( sprite );
		var view = new cases.core.TestView( sprite );
		view.shouldAutobind = false;
		this.soma.addView( "viewname", view );
		view.addEventListener( "testFromView", view.viewListener );
		view.dispatchEvent( new soma.Event("testFromView") );
		view.removeEventListener( "testFromView", view.viewListener );
		this.soma.removeView( "viewname" );
		this.assertEquals( sprite,  cases.core.TestView.scope  );
		cases.core.TestView.scope = null;
	}



	,autoBoundListener: function()
	{
		console.log("called autoBoundListener");
		this.listenerInvocation++;
		this.confirmScope();
	}

	,confirmScope: function()
	{
		this.scopeConfirmed = true;
	}

 });











