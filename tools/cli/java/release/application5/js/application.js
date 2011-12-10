var app = app || {};

app.SomaApplication = new Class({

	Extends: soma.core.Application,

	init: function() {
		
	},

	registerModels: function() {
		this.addModel(app.ApplicationModel.NAME, new app.ApplicationModel());
	},

	registerViews: function() {
		this.addView(app.ApplicationView.NAME, new app.ApplicationView());
	},

	registerCommands: function() {
		this.addCommand(app.ApplicationEvent.SEND_MESSAGE, app.ApplicationCommand);
	},

	registerWires: function() {
		this.addWire(app.ApplicationWire.NAME, new app.ApplicationWire());
	},

	start: function() {
		this.dispatchEvent(new app.ApplicationEvent(app.ApplicationEvent.SEND_MESSAGE));
	}

});

new app.SomaApplication();
