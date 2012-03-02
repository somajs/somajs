var MessageEvent = soma.Event.extend({
	constructor: function(type, message) {
		return soma.Event.call(this, type, {message:message});
	}
});
MessageEvent.REQUEST = "Event::MessageEvent.REQUEST";
MessageEvent.READY = "Event::MessageEvent.READY";