var TestView = new Class({

	Extends: soma.View

	,disposed: false

	,dispose: function() {
		this.disposed = true;
	}

});

var TestCustomEvent = soma.Event.extend();
