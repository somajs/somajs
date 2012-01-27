var SomaApplication = soma.core.Application.extend({
	init: function() {
		console.log('init');
	},
	registerWires: function() {
		this.addWire(SearchWire.NAME, new SearchWire());
		this.addWire(TwitterService.NAME, new TwitterService());
	},
	registerCommands: function() {
		this.addCommand(TwitterEvent.SEARCH, TwitterCommand);
	}
});

new SomaApplication();
