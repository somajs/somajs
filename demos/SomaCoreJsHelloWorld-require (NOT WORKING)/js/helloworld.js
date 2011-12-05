require([
		"libs/mootools-core-1.3-full-nocompat-yc",
		"libs/somacore",
		"app/wires",
		"app/models",
		"app/events",
		"app/commands",
		"app/views"
	], function() {

	var SomaApplication = new Class({
		Extends: soma.core.Application,
		registerWires: function() {
			this.addWire(MessageWire.NAME, new MessageWire);
		},
		init: function() {
			console.log('application facade ready');
		}
	});

	new SomaApplication();

});

