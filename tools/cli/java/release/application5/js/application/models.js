var app = app || {};

app.ApplicationModel = new Class({

	Extends: soma.core.model.Model,

	init: function() {
		this.data = "Hello somacore";
	},

	dispose: function() {
		this.data = null;
	}

});
app.ApplicationModel.NAME = "Model::ApplicationModel";
