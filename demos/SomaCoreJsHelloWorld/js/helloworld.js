var SomaApplication = new Class({

	Extends: soma.core.Core,

	registerWires: function() {
		this.addWire(MessageWire.NAME, new MessageWire);
	},

	init: function() {

	}

});

new SomaApplication();
