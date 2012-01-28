var ApplicationWire = new Class({

	Extends: soma.Wire,

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
ApplicationWire.NAME = "Wire::ApplicationWire";
