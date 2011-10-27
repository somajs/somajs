var MessageCommand = new Class({
	
	Extends:soma.core.controller.Command,

	execute: function(event) {
		console.log('MessageCommand::execute():', event.type, event.message);
        var model = this.getModel(MessageModel.NAME);
        model.requestMessage();
	}
});