var MessageEvent = new Class ({
	
	Extends: soma.Event,

	initialize: function(type, message) {
		return this.parent(type, true, false, {message:message});
	}
	
});
MessageEvent.REQUEST = "Event::MessageEvent.REQUEST";
MessageEvent.READY = "Event::MessageEvent.READY";