var MessageCommand = new Class({
	
	Extends:soma.core.controller.Command,

	execute: function(event) {
        this.getModel(MessageModel.NAME).requestMessage();
	}
});