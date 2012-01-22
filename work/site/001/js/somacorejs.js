var scjs = scjs || {};

scjs.SomaApplication = new Class({

	Extends: soma.core.Application,

	init: function() {
		
	},

	registerModels: function() {
		this.addModel(scjs.ApplicationModel.NAME, new scjs.ApplicationModel());
	},

	registerViews: function() {
		this.addView(scjs.ApplicationView.NAME, new scjs.ApplicationView());
	},

	registerCommands: function() {
		this.addCommand(scjs.ApplicationEvent.SEND_MESSAGE, scjs.ApplicationCommand);
	},

	registerWires: function() {
		this.addWire(scjs.ApplicationWire.NAME, new scjs.ApplicationWire());
	},

	start: function() {
		this.dispatchEvent(new scjs.ApplicationEvent(scjs.ApplicationEvent.SEND_MESSAGE));
	}

});

new scjs.SomaApplication();
