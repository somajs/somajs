var TwitterEvent = soma.Event.extend({
	constructor: function(type, keywords) {
		return soma.Event.call(this, type, {keywords:keywords});
	}
});
TwitterEvent.SEARCH = "TwitterEvent.SEARCH";
TwitterEvent.SEARCH_RESULT = "TwitterEvent.SEARCH_RESULT";
