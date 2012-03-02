var MessageCommand = soma.Command.extend({
	execute: function(event) {
        this.getModel(MessageModel.NAME).requestMessage();
	}
});