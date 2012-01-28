var SomaApplication = soma.Application.extend({

	init: function() {
		
	},

	registerModels: function() {
		this.addModel(ApplicationModel.NAME, new ApplicationModel());
	},

	registerViews: function() {
		this.addView(ApplicationView.NAME, new ApplicationView());
	},

	registerCommands: function() {
		this.addCommand(ApplicationEvent.SEND_MESSAGE, ApplicationCommand);
	},

	registerWires: function() {
		this.addWire(ApplicationWire.NAME, new ApplicationWire());
	},

	start: function() {
		this.dispatchEvent(new ApplicationEvent(ApplicationEvent.SEND_MESSAGE));
	}

});

new SomaApplication();
