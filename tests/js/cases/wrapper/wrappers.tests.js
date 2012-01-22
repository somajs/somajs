var EVENT_TYPE = "test";

var SomaViewTests = new Class ({
	
	Extends: PyrTestCase

	,name: "SomaViewTests"
	,countSuccess: 0
	,countFailure: 0
	,handlerSuccessBound: null
	,handlerFailureBound: null

	,initialize: function() {
		this.handlerSuccessBound = this.handlerSuccess.bind(this);
		this.handlerFailureBound = this.handlerFailure.bind(this);
	}

	,setUp: function() {
		this.countSuccess = 0;
		this.countFailure = 0;
	}

	,tearDown: function() {

	}

	,handlerFailure: function(event) {
		this.countFailure++;
	}

	,handlerSuccess: function(event) {
		this.countSuccess++;
	}

	,test_create_view: function() {
		var view = new soma.View;
		this.assertNotNull(view);
		this.assertTrue(instanceOf(view, soma.View));
	}

	,test_dispose_view: function() {
		var view = new TestView;
		view.dispose();
		this.assertTrue(view.disposed);
	}

	,test_default_domElement: function() {
		var view = new soma.View;
		this.assertNotNull(view.domElement);
		this.assertEquals(view.domElement, document.body);
	}

	,test_get_domElement: function() {
		var element = document.createElement("div");
		var view = new soma.View(element);
		this.assertNotNull(view.domElement);
		this.assertNotEquals(view.domElement, document.body);
		this.assertEquals(view.domElement, element);
	}

	,test_set_domElement: function() {
		var element = document.createElement("div");
		var view = new soma.View;
		this.assertNotNull(view.domElement);
		this.assertEquals(view.domElement, document.body);
		view.domElement = element;
		this.assertNotNull(view.domElement);
		this.assertNotEquals(view.domElement, document.body);
		this.assertEquals(view.domElement, element);
	}

	,test_add_listener: function() {
		var view = new soma.View();
		if (isIeLt9()) {
			var app = new soma.core.Application();
			app.addView("view", view);
		}
		view.addEventListener(EVENT_TYPE, this.handlerSuccessBound, false);
		this.assertTrue(true); // should fail before is something is wrong
	}

	,test_remove_listener: function() {
		var view = new soma.View;
		if (isIeLt9()) {
			var app = new soma.core.Application();
			app.addView("view", view);
		}
		view.addEventListener(EVENT_TYPE, this.handlerFailureBound, false);
		view.removeEventListener(EVENT_TYPE, this.handlerFailureBound, false);
		view.dispatchEvent(new soma.Event(EVENT_TYPE));
		this.assertEquals(0, this.countFailure);
	}

	,test_dispatch_event: function() {
		var view = new soma.View;
		if (isIeLt9()) {
			var app = new soma.core.Application();
			app.addView("view", view);
		}
		view.addEventListener(EVENT_TYPE, this.handlerSuccessBound, false);
		view.dispatchEvent(new soma.Event(EVENT_TYPE));
		this.assertEquals(1, this.countSuccess);
	}

});

var SomaEventTests = new Class ({

	Extends: PyrTestCase

	,name: "SomaEventTests"
	,wrapperEvent: null
	,customEvent: null
	,wrapperEventClone: null
	,customEventClone: null
    ,handlerPreventDefaultBound:null

	,initialize: function() {
		
	}

	,setUp: function() {

        this.wrapperEvent = new soma.Event(EVENT_TYPE);
		this.customEvent = new TestCustomEvent(EVENT_TYPE);
		this.wrapperEventClone = this.wrapperEvent.clone();
		this.customEventClone = this.customEvent.clone();
        this.handlerPreventDefaultBound = this.handlerPreventDefault.bind(this);
	}

	,tearDown: function() {
		this.wrapperEvent = null;
		this.customEvent = null;
		this.wrapperEventClone = null;
		this.customEventClone = null;
        this.handlerPreventDefaultBound = null;
	}

	,handlerEmpty: function(event) {

	}

	,handlerPreventDefault: function(event) {
		event.preventDefault();
        return event;
	}

	,test_create: function() {
		this.assertNotNull(this.wrapperEvent);
		this.assertNotNull(this.customEvent);
		this.assertNotNull(this.wrapperEventClone);
		this.assertNotNull(this.customEventClone);
	}

	,test_type: function() {
		this.assertEquals(this.wrapperEvent.type, EVENT_TYPE);
		this.assertEquals(this.customEvent.type, EVENT_TYPE);
		this.assertEquals(this.wrapperEventClone.type, EVENT_TYPE);
		this.assertEquals(this.customEventClone.type, EVENT_TYPE);
	}

	,test_bubbles_default: function() {
		this.assertTrue(this.wrapperEvent.bubbles);
		this.assertTrue(this.customEvent.bubbles);
		this.assertTrue(this.wrapperEventClone.bubbles);
		this.assertTrue(this.customEventClone.bubbles);
	}

	,test_bubbles_defined: function() {
		var wrapperEvent = new soma.Event(EVENT_TYPE, null, false);
		var customEvent = new TestCustomEvent(EVENT_TYPE, null, false);
		var wrapperEventClone = wrapperEvent.clone();
		var customEventClone = customEvent.clone();
		this.assertFalse(wrapperEvent.bubbles);
		this.assertFalse(customEvent.bubbles);
		this.assertFalse(wrapperEventClone.bubbles);
		this.assertFalse(customEventClone.bubbles);
	}

	,test_cancelable_default: function() {
		this.assertFalse(this.wrapperEvent.cancelable);
		this.assertFalse(this.customEvent.cancelable);
		this.assertFalse(this.wrapperEventClone.cancelable);
		this.assertFalse(this.customEventClone.cancelable);
	}

	,test_cancelable_defined: function() {
		var wrapperEvent = new soma.Event(EVENT_TYPE, null, true, true);
		var customEvent = new TestCustomEvent(EVENT_TYPE, null, true, true);
		var wrapperEventClone = wrapperEvent.clone();
		var customEventClone = customEvent.clone();
		this.assertTrue(wrapperEvent.cancelable);
		this.assertTrue(customEvent.cancelable);
		this.assertTrue(wrapperEventClone.cancelable);
		this.assertTrue(customEventClone.cancelable);
	}

	,test_parameters: function() {
		var parameters = {message: "message"};
		var wrapperEvent = new soma.Event(EVENT_TYPE, parameters, true, true );
		var customEvent = new TestCustomEvent(EVENT_TYPE, parameters, true, true );
		var wrapperEventClone = wrapperEvent.clone();
		var customEventClone = customEvent.clone();
		this.assertNotNull(wrapperEvent.params);
		this.assertEquals(wrapperEvent.params.message, parameters.message);
		this.assertNotNull(customEvent.params);
		this.assertEquals(customEvent.params.message, parameters.message);
		this.assertNotNull(wrapperEventClone.params);
		this.assertEquals(wrapperEventClone.params.message, parameters.message);
		this.assertNotNull(customEventClone.params);
		this.assertEquals(customEventClone.params.message, parameters.message);
	}

	,test_parameters_undefined: function() {
		var wrapperEvent = new soma.Event(EVENT_TYPE, null, true, true);
		var customEvent = new TestCustomEvent(EVENT_TYPE, null, true, true);
		var wrapperEventClone = wrapperEvent.clone();
		var customEventClone = customEvent.clone();
		this.assertUndefined(wrapperEvent.params);
		this.assertUndefined(customEvent.params);
		this.assertUndefined(wrapperEventClone.params);
		this.assertUndefined(customEventClone.params);
	}

	,test_is_cloned: function() {
		this.assertTrue(this.wrapperEventClone.isCloned);
		this.assertTrue(this.customEventClone.isCloned);
	}

	,test_is_default_prevented_default: function() {
		var dispatcher;
		if (isIeLt9()) {
			dispatcher = new soma.EventDispatcher();
		}
		else {
			dispatcher = document.createElement("div");
		}
		dispatcher.addEventListener(EVENT_TYPE, this.handlerEmpty, false);
		dispatcher.dispatchEvent(this.wrapperEvent);
		this.assertFalse(this.wrapperEvent.isDefaultPrevented());
	}


	,test_default_prevented_should_be_true: function() {
		var dispatcher;
		if (isIeLt9()) {
			dispatcher = new soma.EventDispatcher();
		}
		else {
			dispatcher = document.createElement("div");
            dispatcher.id = "testdiv";
		}
		dispatcher.addEventListener(EVENT_TYPE, this.handlerPreventDefaultBound, false);
		var eventWrapper = new soma.Event(EVENT_TYPE, null, true, true);
		var eventCustom = new TestCustomEvent(EVENT_TYPE, null, true, true );
		dispatcher.dispatchEvent(eventWrapper);
		dispatcher.dispatchEvent(eventCustom);
		this.assertTrue(eventWrapper.isDefaultPrevented() );
		this.assertTrue(eventCustom.isDefaultPrevented() );

	}

	,test_default_prevented_should_be_false: function() {
		var dispatcher;
		if (isIeLt9()) {
			dispatcher = new soma.EventDispatcher();
		}
		else {
			dispatcher = document.createElement("div");
		}
		dispatcher.addEventListener(EVENT_TYPE, this.handlerPreventDefaultBound, false);
		var eventWrapper = new soma.Event(EVENT_TYPE, null, true, false);
		var eventCustom = new TestCustomEvent(EVENT_TYPE, null, true, false);
		dispatcher.dispatchEvent(eventWrapper);
		dispatcher.dispatchEvent(eventCustom);
		this.assertFalse(eventWrapper.isDefaultPrevented());
		this.assertFalse(eventCustom.isDefaultPrevented());
	}

});





