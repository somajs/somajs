var MessageCommand = soma.core.controller.Command.extend({
	execute: function(event) {
        this.getModel(MessageModel.NAME).requestMessage();
	}
});