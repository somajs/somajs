var TwitterEvent = new Class({
	Extends: soma.Event,
	initialize: function(type, keywords) {
		console.log('TwitterEvent >', type);
		this.addProp('keywords', keywords);
		if (keywords) console.log('keywords: ', keywords);
		return this.parent(type, true, true);
	}
});
TwitterEvent.SEARCH = "TwitterEvent.SEARCH";
TwitterEvent.SEARCH_RESULT = "TwitterEvent.SEARCH_RESULT";
