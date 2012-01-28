var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.ApplicationWire = soma.Wire.extend({

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(___APPLICATION_NAMESPACE___.ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
___APPLICATION_NAMESPACE___.ApplicationWire.NAME = "Wire::ApplicationWire";
