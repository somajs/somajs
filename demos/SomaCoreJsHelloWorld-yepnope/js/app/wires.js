var MessageWire = new Class({

	Extends: soma.core.wire.Wire,

	init: function() {
		this.addModel(MessageModel.NAME, new MessageModel);
		this.addView(MessageView.NAME, new MessageView);
		this.addCommand(MessageEvent.REQUEST, MessageCommand);
        this.addEventListener(MessageEvent.READY, this.messageReady.bind(this) );
	},

    messageReady: function(event) {
        this.getView(MessageView.NAME).updateMessage(event.message);
    }

});
MessageWire.NAME = "Wire::MessageWire";