var scjs = scjs || {};

scjs.SomaApplication = new Class({

	Extends: soma.core.Application,

	init: function() {
		
	},

	registerModels: function() {
		//this.addModel(scjs.ApplicationModel.NAME, new scjs.ApplicationModel());
	},

	registerViews: function() {
		//this.addView(scjs.ApplicationView.NAME, new scjs.ApplicationView());
	},

	registerCommands: function() {
		this.addCommand(ApplicationEvent.SETUP, ApplicationCommand);
		this.addCommand(NavigationEvent.SELECT, NavigationCommand);
	},

	registerWires: function() {
		this.addWire(ApplicationWire.NAME, new ApplicationWire());
		this.addWire(NavigationWire.NAME, new NavigationWire());
	},

	start: function() {
		this.dispatchEvent(new ApplicationEvent(ApplicationEvent.SETUP));
	}

});

new scjs.SomaApplication();
