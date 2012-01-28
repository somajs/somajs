var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.ApplicationModel = new Class({

	Extends: soma.Model,

	init: function() {
		this.data = "Hello somacore";
	},

	dispose: function() {
		this.data = null;
	}

});
___APPLICATION_NAMESPACE___.ApplicationModel.NAME = "Model::ApplicationModel";
