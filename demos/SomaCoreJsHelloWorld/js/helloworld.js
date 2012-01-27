var SomaApplication = soma.core.Application.extend({
	registerWires: function() {
		this.addWire(MessageWire.NAME, new MessageWire);
	},
	init: function() {

	}
});
new SomaApplication();
