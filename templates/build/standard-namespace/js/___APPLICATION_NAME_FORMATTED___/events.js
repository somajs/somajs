var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.ApplicationEvent = soma.Event.extend({

	initialize: function(type, data, bubbles, cancelable) {
		return this.parent(type, data, bubbles, cancelable);
	}

});
___APPLICATION_NAMESPACE___.ApplicationEvent.SEND_MESSAGE = "ApplicationEvent.SEND_MESSAGE";