;(function (twitter, undefined) {

	'use strict';

	// application
	var App = soma.Application.extend({
		init:function () {
			this.injector.mapClass('service', TwitterService, true);
			this.commands.add(Events.SEARCH, SearchCommand);
		}
	});

	// event types
	var Events = {
		"SEARCH": "search",
		"SEARCH_RESULT": "search_result"
	};

	// command that triggers the search
	// can be used from anywhere
	var SearchCommand = function (service) {
		return {
			execute:function (event) {
				service.search(event.params);
			}
		};
	};

	// service that retrieves the list of tweets from the twitter API
	// dispatches a search result event that can be listened to from anywhere
	var TwitterService = function (dispatcher) {
		var url = "http://search.twitter.com/search.json";
		return {
			search:function (query) {
				$.ajax({
					type:'GET',
					url:url + '?q=' + query,
					jsonp: "callback",
					dataType:'jsonp',
					success:function (data) {
						dispatcher.dispatch(Events.SEARCH_RESULT, data);
					}
				});
			}
		};
	};

	// template to display the list of tweets
	var TwitterTemplate = function(scope, template, element, mediators, dispatcher) {
		// registers listeners to handle search and search results events
		dispatcher.addEventListener(Events.SEARCH, searchHandler);
		dispatcher.addEventListener(Events.SEARCH_RESULT, resultHandler.bind(this));
		// handles a search event, change the message
		function searchHandler(event) {
			scope.message = "Searching...";
			template.render();
		}
		// handles a search result event, change the message and update the tweet list
		function resultHandler(event) {
			scope.tweets = event.params.results;
			scope.message = "Search result: " + scope.tweets.length;
			template.render();
		}
		// opens a new window to the selected tweet
		scope.visit = function(event, user, id) {
			window.open("http://twitter.com/" + user + "/statuses/" + id);
		};
		// triggers search
		scope.search = function(event) {
			var value = $('.queryInput', element).val();
			if (event.which === 13 && value !== "") {
				dispatcher.dispatch(Events.SEARCH, value);
			}
		};
	};

	// create application
	var app = new App();

	// exports
	twitter.TwitterTemplate = TwitterTemplate;

})(window.twitter = window.twitter || {});
