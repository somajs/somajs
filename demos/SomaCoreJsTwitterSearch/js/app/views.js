var MainView = function(){
	this.messageView = document.getElementById("message");
	this.listView = document.getElementById("result-list");
	this.listTemplate = document.getElementById("template-tweet");
	this.searchInput = document.getElementById("search-input");
	this.searchInput.addEventListener('keypress', function(event) {
		if (event.keyCode == 13 && this.value != "") {
			this.dispatchEvent(new TwitterEvent(TwitterEvent.SEARCH, this.value));
		}
	}, false);
};
MainView.prototype = {
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
};

MainView.NAME = "View::MainView";
