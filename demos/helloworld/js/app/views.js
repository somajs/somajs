var MessageView = new Class({

	Extends: soma.View,

	element:null,
	button:null,
	text:null,

	init: function() {
		this.element = document.getElementById("message");
		this.button = document.getElementById("requestMessageButton");
		this.text = document.getElementById("textContainer");
		$(this.button).addEvent('click', this.clickHandler.bind(this), false);
	},
	clickHandler: function() {
		this.dispatchEvent(new MessageEvent(MessageEvent.REQUEST));
	},
    updateMessage: function(message) {
        this.text.innerHTML = message;
    }

});
MessageView.NAME = "View::MessageView";
