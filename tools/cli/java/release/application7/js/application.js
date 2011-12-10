var apppp = apppp || {};

apppp.Constants = {
	EVENT_SEND_MESSAGE: "Event.SEND_MESSAGE",
	APPLICATION_WIRE_NAME: "Wire::ApplicationWire",
	APPLICATION_MODEL_NAME: "Model::ApplicationModel",
	APPLICATION_VIEW_NAME: "View::ApplicationView"
};

apppp.somaApplication = new soma.core.Application();

apppp.ApplicationWire = new Class({
	Extends: soma.core.wire.Wire,
	updateMessage:function(message) {
		this.getView(apppp.Constants.APPLICATION_VIEW_NAME).updateMessage(message);
	}
});

apppp.ApplicationView = new Class({
	Extends: soma.View,
	updateMessage:function(message) {
		document.getElementById('content').innerHTML = message;
	}
});

apppp.ApplicationModel = new Class({
	Extends: soma.core.model.Model,
	init: function() {
		this.data = "Hello somacore";
	}
});

apppp.ApplicationCommand = new Class({
	Extends:soma.core.controller.Command,
	execute: function(event) {
		var message = this.getModel(apppp.Constants.APPLICATION_MODEL_NAME).data;
		this.getWire(apppp.Constants.APPLICATION_WIRE_NAME).updateMessage(message);
	}
});

apppp.somaApplication.addWire(apppp.Constants.APPLICATION_WIRE_NAME, new apppp.ApplicationWire());
apppp.somaApplication.addModel(apppp.Constants.APPLICATION_MODEL_NAME, new apppp.ApplicationModel());
apppp.somaApplication.addView(apppp.Constants.APPLICATION_VIEW_NAME, new apppp.ApplicationView());
apppp.somaApplication.addCommand(apppp.Constants.EVENT_SEND_MESSAGE, apppp.ApplicationCommand);

apppp.somaApplication.dispatchEvent(new soma.Event(apppp.Constants.EVENT_SEND_MESSAGE));
