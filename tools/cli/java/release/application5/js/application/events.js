var app = app || {};

app.ApplicationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, data, bubbles, cancelable) {
		return this.parent(type, data, bubbles, cancelable);
	}

});
app.ApplicationEvent.SEND_MESSAGE = "ApplicationEvent.SEND_MESSAGE";
