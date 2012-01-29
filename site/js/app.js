var SomaApplication = soma.Application.extend({

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
		this.addCommand(ChapterEvent.NEXT, ChapterCommand);
	},

	registerWires: function() {
		this.addWire(ApplicationWire.NAME, new ApplicationWire());
		this.addWire(NavigationWire.NAME, new NavigationWire());
		this.addWire(TutorialWire.NAME, new TutorialWire());
	},

	start: function() {
		this.dispatchEvent(new ApplicationEvent(ApplicationEvent.SETUP));
	}

});

new SomaApplication();
//
//var logCount = 0;
//
//function log(value) {
//	logCount++;
//	console.log(logCount + ". " + value + "<br/>");
//}
