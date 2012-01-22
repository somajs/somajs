var scjs = scjs || {};

scjs.ApplicationCommand = new Class({

	Extends:soma.core.controller.Command,

	execute: function(event) {
		switch(event.type) {
			case scjs.ApplicationEvent.SEND_MESSAGE:
				var message = this.getModel(scjs.ApplicationModel.NAME).data;
				this.getWire(scjs.ApplicationWire.NAME).updateMessage(message);
				break;
		}
	}

});
