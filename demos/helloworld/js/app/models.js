var MessageModel = soma.Model.extend({
	init: function() {

	},
    requestMessage: function() {
        this.data = "Hello soma.js!";
        this.dispatchEvent(new MessageEvent(MessageEvent.READY, this.data));
    }
});
MessageModel.NAME = "Model::MessageModel";