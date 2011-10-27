var TwitterService = new Class({
	Extends: soma.core.wire.Wire,
	url: "http://search.twitter.com/search.json",
	lastResult: null,
	init: function() {
		console.log('init service');
	},
	search: function(keywords) {
		var self = this;
		console.log('search with: ', keywords);
		var result = [];
		$.getJSON(this.url + '?q=' + keywords + '&callback=?', function(data) {
			$.each(data.results, function(i, item) {
				result.push(item);
			});
			console.log('search successful, number of result: ', result.length);
			self.lastResult = result;
			self.dispatchEvent(new TwitterEvent(TwitterEvent.SEARCH_RESULT));
		});
	}
});
TwitterService.NAME = "Wire::TwitterService";
