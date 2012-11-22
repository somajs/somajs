;(function (ns, undefined) {

	var App = soma.Application.extend({
		init:function () {
			this.injector.mapClass('service', TwitterService, true);
			this.commands.add(Events.SEARCH, SearchCommand);
			this.mediators.create(MediatorInput, $('.twitter .queryInput'));
			this.mediators.create(MediatorMessage, $('.twitter .message'));
			this.mediators.create(MediatorResult, $('.twitter .result'));
		}
	});

	var Events = {
		"SEARCH": "search",
		"SEARCH_RESULT": "search_result"
	}

	var SearchCommand = function (service) {
		return {
			execute:function (event) {
				service.search(event.params);
			}
		}
	};

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

	var MediatorInput = function (target, dispatcher) {
		setTimeout(function () { $(target).focus(); }, 50);
		$(target).keypress(function (event) {
			if (event.keyCode === 13 && this.value !== "") {
				dispatcher.dispatch(Events.SEARCH, this.value);
			}
		});
	};

	var MediatorMessage = function (target, dispatcher) {

		dispatcher.addEventListener(Events.SEARCH, searchHandler);
		dispatcher.addEventListener(Events.SEARCH_RESULT, resultHandler);

		function searchHandler(event) {
			$(target).html("Searching...");
		}

		function resultHandler(event) {
			$(target).html("Search result: " + event.params.results.length);
		}
	};

	var MediatorResult = function (target, dispatcher) {

		$(target).on('click', 'li', clickHandler);

		dispatcher.addEventListener(Events.SEARCH_RESULT, resultHandler);

		function resultHandler(event) {
			var list = $('ul', target).html("");
			$(event.params.results).each(function (i, el) {
				list.append('<li data-id-str="' + el.id_str + '" data-user="' + el.from_user + '"><div class="tpl-tweet"><img src="' + el.profile_image_url + '" alt=""/><div class="tpl-tweet-username">' + el.from_user + '</div><div class="tpl-tweet-text">' + el.text + '</div></div></li>');
			});
		}

		function clickHandler(event) {
			var user = $(this).attr('data-user');
			var id = $(this).attr('data-id-str');
			window.open("http://twitter.com/" + user + "/statuses/" + id);
		}
	};

	var app = new App();

})(this['ns'] = this['ns'] || {});
