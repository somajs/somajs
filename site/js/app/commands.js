ApplicationCommand = soma.Command.extend({
	execute: function(event) {
		switch(event.type) {
			case ApplicationEvent.SETUP:
				this.getWire(ApplicationWire.NAME).setup();
				this.getWire(NavigationWire.NAME).setup();
				break;
		}
	}
});

NavigationCommand = soma.Command.extend({
	execute: function(event) {
		switch(event.type) {
			case NavigationEvent.SELECT:
				this.getWire(ApplicationWire.NAME).select(event.params.navigationId);
				this.getWire(NavigationWire.NAME).select(event.params.navigationId);
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECTED, event.params.navigationId));
				break;
		}
	}
});

ChapterCommand = soma.Command.extend({
	execute: function(event) {
		console.log("in command", event);
		switch(event.type) {
			case ChapterEvent.NEXT:
				this.getWire(event.params.chapterId).next();
				break;
			case ChapterEvent.ACTIVATE:
				console.log("execute", event.params.chapterId);
				this.getWire(event.params.chapterId).activate();
				break;
		}
	}
});
