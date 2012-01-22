var scjs = scjs || {};

scjs.ApplicationModel = new Class({

	Extends: soma.core.model.Model,

	init: function() {
		this.data = "Hello somacore";
	},

	dispose: function() {
		this.data = null;
	}

});
scjs.ApplicationModel.NAME = "Model::ApplicationModel";
