ApplicationModel = new Class({

	Extends: soma.core.model.Model,

	init: function() {
		this.data = "Hello somacore";
	},

	dispose: function() {
		this.data = null;
	}

});
ApplicationModel.NAME = "Model::ApplicationModel";
