;(function (twitter, undefined) {

	// application
	var App = soma.Application.extend({
		init:function () {
			this.createPlugin(soma.template.plugin);
			this.injector.mapClass('service', TwitterService, true);
			this.commands.add(Events.SEARCH, SearchCommand);
		}
	});

	// event types
	var Events = {
		"SEARCH": "search",
		"SEARCH_RESULT": "search_result"
	}

	// command that triggers the search
	// can be used from anywhere
	var SearchCommand = function (service) {
		return {
			execute:function (event) {
				service.search(event.params);
			}
		}
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
					dataType:'jsonp',
					success:function (data) {
						dispatcher.dispatch(Events.SEARCH_RESULT, data);
					}
				});
			}
		}
	};

	// template to display the list of tweets
	var TwitterTemplate = function(scope, template, element, mediators, dispatcher) {
		// creates a mediator to handle the output (for the sake of the example)
		mediators.create(MediatorInput, $('.queryInput', element));
		// registers listeners to handle search and search results events
		dispatcher.addEventListener(Events.SEARCH, searchHandler);
		dispatcher.addEventListener(Events.SEARCH_RESULT, resultHandler);
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
		$(element).on('click', 'li', function() {
			window.open("http://twitter.com/" + $(this).attr('data-user') + "/statuses/" + $(this).attr('data-id-str'));
		});
	};

	// mediator that handles the text input
	var MediatorInput = function (target, dispatcher) {
		// set focus on the text input
		setTimeout(function () { $(target).focus(); }, 50);
		// handle keyboard event (ENTER)
		$(target).keypress(function (event) {
			if (event.keyCode === 13 && this.value !== "") {
				dispatcher.dispatch(Events.SEARCH, this.value);
			}
		});
	};

	// create application
	var app = new App();

	// exports
	twitter.TwitterTemplate = TwitterTemplate;

})(this['twitter'] = this['twitter'] || {});
