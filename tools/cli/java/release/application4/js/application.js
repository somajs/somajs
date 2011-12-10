var app = app || {};

app.Constants = {
	EVENT_SEND_MESSAGE: "Event.SEND_MESSAGE",
	APPLICATION_WIRE_NAME: "Wire::ApplicationWire",
	APPLICATION_MODEL_NAME: "Model::ApplicationModel",
	APPLICATION_VIEW_NAME: "View::ApplicationView"
};

app.somaApplication = new soma.core.Application();

app.ApplicationWire = new Class({
	Extends: soma.core.wire.Wire,
	updateMessage:function(message) {
		this.getView(app.Constants.APPLICATION_VIEW_NAME).updateMessage(message);
	}
});

app.ApplicationView = new Class({
	Extends: soma.View,
	updateMessage:function(message) {
		document.getElementById('content').innerHTML = message;
	}
});

app.ApplicationModel = new Class({
	Extends: soma.core.model.Model,
	init: function() {
		this.data = "Hello somacore";
	}
});

app.ApplicationCommand = new Class({
	Extends:soma.core.controller.Command,
	execute: function(event) {
		var message = this.getModel(app.Constants.APPLICATION_MODEL_NAME).data;
		this.getWire(app.Constants.APPLICATION_WIRE_NAME).updateMessage(message);
	}
});

app.somaApplication.addWire(app.Constants.APPLICATION_WIRE_NAME, new app.ApplicationWire());
app.somaApplication.addModel(app.Constants.APPLICATION_MODEL_NAME, new app.ApplicationModel());
app.somaApplication.addView(app.Constants.APPLICATION_VIEW_NAME, new app.ApplicationView());
app.somaApplication.addCommand(app.Constants.EVENT_SEND_MESSAGE, app.ApplicationCommand);

app.somaApplication.dispatchEvent(new soma.Event(app.Constants.EVENT_SEND_MESSAGE));
