var SearchWire = new Class({

	Extends: soma.core.wire.Wire,

	init: function() {
		this.addView(MainView.NAME, new MainView);
		this.core.addEventListener(TwitterEvent.SEARCH, this.searchHandler.bind(this));
		this.core.addEventListener(TwitterEvent.SEARCH_RESULT, this.searchResultHandler.bind(this));
	},

	searchHandler: function(event) {
		this.getView(MainView.NAME).messageView.innerHTML = "Searching...";
	},

	searchResultHandler: function(event) {
		var result = this.getWire(TwitterService.NAME).lastResult;
		this.getView(MainView.NAME).updateTweets(result);
	}
	
});

SearchWire.NAME = "Wire::SearchWire";
