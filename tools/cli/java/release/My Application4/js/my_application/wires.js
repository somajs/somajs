var app = app || {};

app.ApplicationWire = new Class({

	Extends: soma.core.wire.Wire,

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(app.ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
app.ApplicationWire.NAME = "Wire::ApplicationWire";
