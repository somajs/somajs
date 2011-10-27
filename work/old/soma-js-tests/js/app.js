var CommandList = {
	STARTUP: "startup"
};

var SomaApp = new Class ({
		Extends: soma.core.Core,
		registerCommands: function() {
			this.addCommand(CommandList.STARTUP, StartCommand);
		},
		registerModels: function() {
			
		},
		registerWires: function() {
			
		},
		registerViews: function() {
		
		},
		init: function() {
			//this.dispatchEvent(new soma.Event( CommandList.STARTUP));
		}
} );

var StartCommand = new Class ({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		console.log( "StartCommand::execute():", event.type );
	}
});

new SomaApp( "root" );
