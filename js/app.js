var SomaApplication = soma.Application.extend({

	init: function() {

	},

	registerCommands: function() {
		this.addCommand(ApplicationEvent.SETUP, ApplicationCommand);
		this.addCommand(ApplicationEvent.CLEANUP, ApplicationCommand);
		this.addCommand(NavigationEvent.SELECT, NavigationCommand);
		this.addCommand(NavigationEvent.SELECT_TUTORIAL, NavigationCommand);
		this.addCommand(ChapterEvent.PREVIOUS, ChapterCommand);
		this.addCommand(ChapterEvent.NEXT, ChapterCommand);
		this.addCommand(ChapterEvent.ACTIVATE, ChapterCommand);
		this.addCommand(ExerciseEvent.RECORD, ExerciseCommand);
	},

	registerWires: function() {
		this.addWire(ApplicationWire.NAME, new ApplicationWire());
		this.addWire(NavigationWire.NAME, new NavigationWire());
		this.addWire(TutorialWire.NAME, new TutorialWire());
	},

	start: function() {
		this.dispatchEvent(new ApplicationEvent(ApplicationEvent.SETUP));
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.ABOUT));
	}

});

new SomaApplication();
