var ApplicationEvent = soma.Event.extend({

	constructor: function(type, data, bubbles, cancelable) {
		return soma.Event.call(this, type, data, bubbles, cancelable);
	}

});
ApplicationEvent.SEND_MESSAGE = "ApplicationEvent.SEND_MESSAGE";