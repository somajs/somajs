var MessageWire = new Class({

	Extends: soma.core.wire.Wire,

    view:null,

	init: function() {
		console.log('init wire');
		this.addModel(MessageModel.NAME, new MessageModel);
		this.view = this.addView(MessageView.NAME, new MessageView);
		this.addCommand(MessageEvent.REQUEST, MessageCommand);
        this.addEventListener(MessageEvent.READY, this.messageReady.bind(this) );
	},

    messageReady: function(event) {
        console.log('MessageWire received the message:', event.message);
        this.view.updateMessage(event.message);
    }

});
MessageWire.NAME = "Wire::MessageWire";