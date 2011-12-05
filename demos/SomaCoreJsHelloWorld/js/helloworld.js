var SomaApplication = new Class({

	Extends: soma.core.Application,

	registerWires: function() {
		this.addWire(MessageWire.NAME, new MessageWire);
	},

	init: function() {

	}

});

new SomaApplication();
