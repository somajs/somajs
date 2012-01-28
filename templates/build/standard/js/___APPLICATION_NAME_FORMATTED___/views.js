var ApplicationView = soma.View.extend({

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
ApplicationView.NAME = "View::ApplicationView";
