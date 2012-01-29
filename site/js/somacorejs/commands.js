ApplicationCommand = new Class({

	Extends:soma.core.controller.Command,

	execute: function(event) {
		switch(event.type) {
			case ApplicationEvent.SETUP:
				this.getWire(ApplicationWire.NAME).setup();
				this.getWire(NavigationWire.NAME).setup();
				break;
		}
	}

});

NavigationCommand = new Class({

	Extends:soma.core.controller.Command,

	execute: function(event) {
		switch(event.type) {
			case NavigationEvent.SELECT:
				this.getWire(ApplicationWire.NAME).select(event.params.navigationId);
				this.getWire(NavigationWire.NAME).select(event.params.navigationId);
				break;
		}
	}

});
