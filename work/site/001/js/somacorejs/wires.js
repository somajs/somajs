var scjs = scjs || {};

scjs.ApplicationWire = new Class({

	Extends: soma.core.wire.Wire,

	init: function() {
		
	},

	updateMessage:function(message) {
		this.getView(scjs.ApplicationView.NAME).updateMessage(message);
	},

	dispose: function() {

	}

});
scjs.ApplicationWire.NAME = "Wire::ApplicationWire";
