var TwitterEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, keywords) {
		return this.parent(type, {keywords:keywords}, true, true );
	}

});

TwitterEvent.SEARCH = "TwitterEvent.SEARCH";
TwitterEvent.SEARCH_RESULT = "TwitterEvent.SEARCH_RESULT";
