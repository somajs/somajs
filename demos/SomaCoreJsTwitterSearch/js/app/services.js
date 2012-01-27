var TwitterService = function(){
	soma.core.wire.Wire.call(this);
};
TwitterService.prototype = new soma.core.wire.Wire();
TwitterService.prototype.constructor = TwitterService;
soma.extend(TwitterService.prototype, {
	url: "http://search.twitter.com/search.json",
	lastResult: null,
	init: function() {},
	search: function(keywords) {
		var self = this;
		var result = [];
		$.getJSON(this.url + '?q=' + keywords + '&callback=?', function(data) {
			$.each(data.results, function(i, item) {
				result.push(item);
			});
			self.lastResult = result;
			self.dispatchEvent(new TwitterEvent(TwitterEvent.SEARCH_RESULT));
		});
	}
});
TwitterService.NAME = "Wire::TwitterService";
