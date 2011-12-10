var app = app || {};

app.ApplicationCommand = new Class({

	Extends:soma.core.controller.Command,

	execute: function(event) {
		switch(event.type) {
			case app.ApplicationEvent.SEND_MESSAGE:
				var message = this.getModel(app.ApplicationModel.NAME).data;
				this.getWire(app.ApplicationWire.NAME).updateMessage(message);
				break;
		}
	}

});
