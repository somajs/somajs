var MainView = new Class({

	Extends: soma.View,

	searchInput: null,
	messageView: null,
	listView: null,
	listTemplate: null,

	init: function() {
		this.messageView = document.getElementById("message");
		this.listView = document.getElementById("result-list");
		this.listTemplate = document.getElementById("template-tweet");
		this.searchInput = document.getElementById("search-input");
		// it is not possible without hacks to dispatch custom event from a DOM element with IE7 and IE8
		// the variable "self" keeps a reference to the view (soma.View) so an event can be dispatched from
		var self = this;
		$(this.searchInput).keypress(function(event) {
			if (event.keyCode == 13 && this.value != "") {
				self.dispatchEvent(new TwitterEvent(TwitterEvent.SEARCH, this.value));
			}
		});
	},

	updateTweets: function(data) {
		$("#result-list").empty();
		$.template("listTemplate", $("#template-tweet"));
		$.tmpl("listTemplate", data).appendTo($("#result-list"));
		$("#result-list li").each(function(i) {
			$(this).click(function() {
				window.open("https://twitter.com/#!/" + data[i].from_user);
			});
		});
		$("#result-list li:even").css("background-color", "#F8F8F8");
		this.messageView.innerHTML = "search result: " + data.length;
	}

});

MainView.NAME = "View::MainView";
