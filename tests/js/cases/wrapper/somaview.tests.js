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
		var element = new Element('div');
		var view = new soma.View(element);
		this.assertNotNull(view.domElement);
		this.assertNotEquals(view.domElement, document.body);
		this.assertEquals(view.domElement, element);
	}

	,test_set_domElement: function() {
		var element = new Element('div');
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



