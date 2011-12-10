var app = app || {};

app.ApplicationView = new Class({

	Extends: soma.View,

	view: null,

	init: function() {
		this.view = document.getElementById('content');
	},

	updateMessage:function(message) {
		this.view.innerHTML = message;
	},

	dispose: function() {
		this.view = null;
	}

});
app.ApplicationView.NAME = "View::ApplicationView";
