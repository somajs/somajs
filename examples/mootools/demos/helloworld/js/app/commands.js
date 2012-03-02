var MessageCommand = new Class({
	
	Extends:soma.Command,

	execute: function(event) {
        this.getModel(MessageModel.NAME).requestMessage();
	}
});