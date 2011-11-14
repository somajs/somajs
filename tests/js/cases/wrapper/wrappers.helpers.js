var TestView = new Class({

	Extends: soma.View

	,disposed: false

	,dispose: function() {
		this.disposed = true;
	}

});

var TestCustomEvent = new Class({

	Extends: soma.Event

	,initialize: function(type, bubbles, cancelable, data) {
		return this.parent(type, bubbles, cancelable, data);
	}
});