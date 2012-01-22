var scjs = scjs || {};

scjs.ApplicationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, data, bubbles, cancelable) {
		return this.parent(type, data, bubbles, cancelable);
	}

});
scjs.ApplicationEvent.SEND_MESSAGE = "ApplicationEvent.SEND_MESSAGE";