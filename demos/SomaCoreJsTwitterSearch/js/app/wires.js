var SearchWire = new Class({
	Extends: soma.core.wire.Wire,
	init: function() {
		console.log('init wire');
		this.addView(MainView.NAME, new MainView);
		this.core.addEventListener(TwitterEvent.SEARCH, this.searchHandler.bind(this));
		this.core.addEventListener(TwitterEvent.SEARCH_RESULT, this.searchResultHandler.bind(this));
	},
	searchHandler: function(event) {
		this.getView(MainView.NAME).messageView.innerHTML = "Searching...";
		console.log('> search handler');
	},
	searchResultHandler: function(event) {
		console.log('> search result handler');
		var result = this.getWire(TwitterService.NAME).lastResult;
		this.getView(MainView.NAME).updateTweets(result);
	}
});
SearchWire.NAME = "Wire::SearchWire";
