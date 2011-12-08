var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.ApplicationWire = new Class({

	Extends: soma.core.wire.Wire,

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(___APPLICATION_NAMESPACE___.ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
___APPLICATION_NAMESPACE___.ApplicationWire.NAME = "Wire::ApplicationWire";
