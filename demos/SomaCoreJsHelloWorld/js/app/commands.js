var MessageCommand = new Class({
	
	Extends:soma.core.controller.Command,

	execute: function(event) {
		console.log('MessageCommand::execute():', event.type, event.message);
        this.getModel(MessageModel.NAME).requestMessage();;
	}
});