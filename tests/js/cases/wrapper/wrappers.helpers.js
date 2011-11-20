var TestView = new Class({

	Extends: soma.View

	,disposed: false

	,dispose: function() {
		this.disposed = true;
	}

});

var TestCustomEvent = new Class({

	Extends: soma.Event
});