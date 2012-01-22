var scjs = scjs || {};

scjs.ApplicationView = new Class({

	Extends: soma.View,

	view: null,

	init: function() {
		this.view = document.getElementById('content');
	},

	updateMessage:function(message) {
		//this.view.innerHTML = message;
	},

	dispose: function() {
		this.view = null;
	}

});
scjs.ApplicationView.NAME = "View::ApplicationView";
