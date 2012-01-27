var SomaApplication = function(){
	soma.core.Application.call(this);
};
SomaApplication.prototype = new soma.core.Application();
SomaApplication.prototype.constructor = SomaApplication;
soma.extend(SomaApplication.prototype, {
	init: function() {

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
