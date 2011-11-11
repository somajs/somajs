var MessageModel = new Class({

	Extends: soma.core.model.Model,

    message:null,
	
	init: function() {

	},

    requestMessage: function() {
        message = "Hello SomaCore JS!";
        this.dispatchEvent(new MessageEvent(MessageEvent.READY, message));
    }

});
MessageModel.NAME = "Model::MessageModel";