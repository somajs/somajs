var ApplicationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, data, bubbles, cancelable) {
		return this.parent(type, data, bubbles, cancelable);
	}

});
ApplicationEvent.SEND_MESSAGE = "ApplicationEvent.SEND_MESSAGE";
