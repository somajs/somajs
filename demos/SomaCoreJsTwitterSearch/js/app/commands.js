var TwitterCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		switch(event.type) {
			case TwitterEvent.SEARCH:
				console.log('TwitterCommand::execute with: ', event.keywords);
				var service = this.getWire(TwitterService.NAME);
				service.search(event.keywords);
		}
	}
});
