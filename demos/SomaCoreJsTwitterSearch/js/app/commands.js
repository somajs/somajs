var TwitterCommand = soma.Command.extend({
	execute: function(event) {
		switch(event.type) {
			case TwitterEvent.SEARCH:
				this.getWire(TwitterService.NAME).search(event.params.keywords);
		}
	}
});
