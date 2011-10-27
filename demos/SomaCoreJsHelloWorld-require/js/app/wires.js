var MessageWire = new Class({

	Extends: soma.core.wire.Wire,

    view:null,

	init: function() {
		console.log('init wire');
		this.addModel(MessageModel.NAME, new MessageModel);
		view = this.addView(MessageView.NAME, new MessageView);
		this.addCommand(MessageEvent.REQUEST, MessageCommand);
        this.core.addEventListener(MessageEvent.READY, this.messageReady);
	},

    messageReady: function(event) {
        console.log('MessageWire received the message:', event.message);
        //var view = this.getView(MessageView.NAME);
        view.updateMessage(event.message);
    }

});
MessageWire.NAME = "Wire::MessageWire";