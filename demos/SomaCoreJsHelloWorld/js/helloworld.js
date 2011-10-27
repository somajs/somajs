var SomaApplication = new Class({
	Extends: soma.core.Core,
	registerWires: function() {
		this.addWire(MessageWire.NAME, new MessageWire);
	},
	init: function() {
		console.log('application facade ready');
	}
});

new SomaApplication();
