var MessageWire = soma.Wire.extend({
	init: function() {
		this.addModel(MessageModel.NAME, new MessageModel);
		this.addView(MessageView.NAME, new MessageView);
		this.addCommand(MessageEvent.REQUEST, MessageCommand);
        this.addEventListener(MessageEvent.READY, this.messageReady.bind(this), false);
	},
    messageReady: function(event) {
        this.getView(MessageView.NAME).updateMessage(event.params.message);
    }
});
MessageWire.NAME = "Wire::MessageWire";