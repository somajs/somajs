var MessageEvent = new Class ({
	
	Extends: soma.Event,

	initialize: function(type, message) {
		console.log(type);
		if (message) console.log('message in event: ' + message);
		return this.parent(type, true, false, {message:message});
	}
	
});
MessageEvent.REQUEST = "Event::MessageEvent.REQUEST";
MessageEvent.READY = "Event::MessageEvent.READY";