ApplicationModel = soma.Model.extend({

	init: function() {
		this.data = "Hello somacore";
	},

	dispose: function() {
		this.data = null;
	}

});
ApplicationModel.NAME = "Model::ApplicationModel";
