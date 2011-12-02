var MessageEvent = new Class ({
	
	Extends: soma.Event,

	initialize: function(type, message) {
		return this.parent(type, {message:message});
	}
	
});
MessageEvent.REQUEST = "Event::MessageEvent.REQUEST";
MessageEvent.READY = "Event::MessageEvent.READY";