var ApplicationWire = soma.Wire.extend({

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
ApplicationWire.NAME = "Wire::ApplicationWire";
