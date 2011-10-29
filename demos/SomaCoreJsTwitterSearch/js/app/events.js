var TwitterEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, keywords) {
		return this.parent(type, true, true, {keywords:keywords});
	}

});

TwitterEvent.SEARCH = "TwitterEvent.SEARCH";
TwitterEvent.SEARCH_RESULT = "TwitterEvent.SEARCH_RESULT";
