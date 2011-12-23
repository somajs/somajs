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
		this.countFailure++
	}

	,handlerSuccess: function(event) {
		this.countSuccess++
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
		var view = new soma.View;
		view.addEventListener(EVENT_TYPE, this.handlerSuccessBound);
		this.assertTrue(true);
	}

	,test_remove_listener: function() {
		var view = new soma.View;
		view.addEventListener(EVENT_TYPE, this.handlerFailureBound);
		view.removeEventListener(EVENT_TYPE, this.handlerFailureBound);
		view.dispatchEvent(new soma.Event(EVENT_TYPE));
		this.assertEquals(this.countFailure, 0);
	}

	,test_dispatch_event: function() {
		var view = new soma.View;
		view.addEventListener(EVENT_TYPE, this.handlerSuccessBound);
		view.dispatchEvent(new soma.Event(EVENT_TYPE));
		this.assertEquals(this.countSuccess, 1);
	}

});

var SomaEventTests = new Class ({

	Extends: PyrTestCase

	,name: "SomaEventTests"
	,wrapperEvent: null
	,customEvent: null
	,wrapperEventClone: null
	,customEventClone: null

	,initialize: function() {
		
	}

	,setUp: function() {
		this.wrapperEvent = new soma.Event(EVENT_TYPE);
		this.customEvent = new TestCustomEvent(EVENT_TYPE);
		this.wrapperEventClone = this.wrapperEvent.clone();
		this.customEventClone = this.customEvent.clone();
	}

	,tearDown: function() {
		this.wrapperEvent = null;
		this.customEvent = null;
		this.wrapperEventClone = null;
		this.customEventClone = null;
	}

	,handlerEmpty: function(event) {

	}

	,handlerPreventDefault: function(event) {
		event.preventDefault();
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
		var el = document.createElement("div");
		el.addEventListener(EVENT_TYPE, this.handlerEmpty);
		el.dispatchEvent(this.wrapperEvent);
		this.assertFalse(this.wrapperEvent.isDefaultPrevented());
	}

	,test_is_default_prevented_defined_success: function() {
		var el = document.createElement("div");
		el.addEventListener(EVENT_TYPE, this.handlerPreventDefault);
		var eventWrapper = new soma.Event(EVENT_TYPE, null, true, true);
		var eventCustom = new TestCustomEvent(EVENT_TYPE, null, true, true);
		el.dispatchEvent(eventWrapper);
		el.dispatchEvent(eventCustom);
		this.assertTrue(eventWrapper.isDefaultPrevented());
		this.assertTrue(eventCustom.isDefaultPrevented());
	}

	,test_is_default_prevented_defined_fail: function() {
		var el = document.createElement("div");
		el.addEventListener(EVENT_TYPE, this.handlerPreventDefault);
		var eventWrapper = new soma.Event(EVENT_TYPE, null, true, false);
		var eventCustom = new TestCustomEvent(EVENT_TYPE, null, true, false);
		el.dispatchEvent(eventWrapper);
		el.dispatchEvent(eventCustom);
		this.assertFalse(eventWrapper.isDefaultPrevented());
		this.assertFalse(eventCustom.isDefaultPrevented());
	}

});





