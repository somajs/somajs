Constants = {
	EVENT_SEND_MESSAGE: "Event.SEND_MESSAGE",
	APPLICATION_WIRE_NAME: "Wire::ApplicationWire",
	APPLICATION_MODEL_NAME: "Model::ApplicationModel",
	APPLICATION_VIEW_NAME: "View::ApplicationView"
}

var somaApplication = new soma.core.Application();

var ApplicationWire = new Class({
	Extends: soma.core.wire.Wire,
	updateMessage:function(message) {
		this.getView(Constants.APPLICATION_VIEW_NAME).updateMessage(message);
	}
});

var ApplicationView = new Class({
	Extends: soma.View,
	updateMessage:function(message) {
		document.getElementById('content').innerHTML = message;
	}
});

var ApplicationModel = new Class({
	Extends: soma.core.model.Model,
	init: function() {
		this.data = "Hello somacore";
	}
});

var ApplicationCommand = new Class({
	Extends:soma.core.controller.Command,
	execute: function(event) {
		var message = this.getModel(Constants.APPLICATION_MODEL_NAME).data;
		this.getWire(Constants.APPLICATION_WIRE_NAME).updateMessage(message);
	}
});

somaApplication.addWire(Constants.APPLICATION_WIRE_NAME, new ApplicationWire());
somaApplication.addModel(Constants.APPLICATION_MODEL_NAME, new ApplicationModel());
somaApplication.addView(Constants.APPLICATION_VIEW_NAME, new ApplicationView());
somaApplication.addCommand(Constants.EVENT_SEND_MESSAGE, ApplicationCommand);

somaApplication.dispatchEvent(new soma.Event(Constants.EVENT_SEND_MESSAGE));
