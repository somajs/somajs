var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.Constants = {
	EVENT_SEND_MESSAGE: "Event.SEND_MESSAGE",
	APPLICATION_WIRE_NAME: "Wire::ApplicationWire",
	APPLICATION_MODEL_NAME: "Model::ApplicationModel",
	APPLICATION_VIEW_NAME: "View::ApplicationView"
};

___APPLICATION_NAMESPACE___.somaApplication = new soma.Application();

___APPLICATION_NAMESPACE___.ApplicationWire = soma.Wire.extend({
	updateMessage:function(message) {
		this.getView(___APPLICATION_NAMESPACE___.Constants.APPLICATION_VIEW_NAME).updateMessage(message);
	}
});

___APPLICATION_NAMESPACE___.ApplicationView = soma.View.extend({
	updateMessage:function(message) {
		document.getElementById('content').innerHTML = message;
	}
});

___APPLICATION_NAMESPACE___.ApplicationModel = soma.Model.extend({
	init: function() {
		this.data = "Hello somacore";
	}
});

___APPLICATION_NAMESPACE___.ApplicationCommand = soma.Command.extend({
	execute: function(event) {
		var message = this.getModel(___APPLICATION_NAMESPACE___.Constants.APPLICATION_MODEL_NAME).data;
		this.getWire(___APPLICATION_NAMESPACE___.Constants.APPLICATION_WIRE_NAME).updateMessage(message);
	}
});

___APPLICATION_NAMESPACE___.somaApplication.addWire(___APPLICATION_NAMESPACE___.Constants.APPLICATION_WIRE_NAME, new ___APPLICATION_NAMESPACE___.ApplicationWire());
___APPLICATION_NAMESPACE___.somaApplication.addModel(___APPLICATION_NAMESPACE___.Constants.APPLICATION_MODEL_NAME, new ___APPLICATION_NAMESPACE___.ApplicationModel());
___APPLICATION_NAMESPACE___.somaApplication.addView(___APPLICATION_NAMESPACE___.Constants.APPLICATION_VIEW_NAME, new ___APPLICATION_NAMESPACE___.ApplicationView());
___APPLICATION_NAMESPACE___.somaApplication.addCommand(___APPLICATION_NAMESPACE___.Constants.EVENT_SEND_MESSAGE, ___APPLICATION_NAMESPACE___.ApplicationCommand);

___APPLICATION_NAMESPACE___.somaApplication.dispatchEvent(new soma.Event(___APPLICATION_NAMESPACE___.Constants.EVENT_SEND_MESSAGE));
