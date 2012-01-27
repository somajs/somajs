var TwitterCommand = function(){
	soma.core.controller.Command.call(this);
};
TwitterCommand.prototype = new soma.core.controller.Command();
TwitterCommand.prototype.constructor = TwitterCommand;
soma.extend(TwitterCommand.prototype, {
	execute: function(event) {
		switch(event.type) {
			case TwitterEvent.SEARCH:
				this.getWire(TwitterService.NAME).search(event.params.keywords);
		}
	}
});
