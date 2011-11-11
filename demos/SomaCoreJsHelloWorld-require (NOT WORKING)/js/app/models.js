var MessageModel = new Class({

	Extends: soma.core.model.Model,

    message:null,
	
	init: function() {
		console.log('init model');
	},

    requestMessage: function() {
        message = "Hello SomaCore JS!";
        console.log('Request message and dispatch ready event');
        this.core.dispatchEvent(new MessageEvent(MessageEvent.READY, message));
    }

});
MessageModel.NAME = "Model::MessageModel";