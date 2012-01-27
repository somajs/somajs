var SearchWire = function(){
	soma.core.wire.Wire.call(this);
};
SearchWire.prototype = new soma.core.wire.Wire();
SearchWire.prototype.constructor = SearchWire;
soma.extend(SearchWire.prototype, {
	init: function() {
		this.addView(MainView.NAME, new MainView());
		this.addEventListener(TwitterEvent.SEARCH, this.searchHandler.bind(this), false);
		this.addEventListener(TwitterEvent.SEARCH_RESULT, this.searchResultHandler.bind(this), false);
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
