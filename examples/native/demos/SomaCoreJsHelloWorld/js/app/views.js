var MessageView = soma.View.extend({
	element:null,
	button:null,
	text:null,
	init: function() {
		this.element = document.getElementById("message");
		this.button = document.getElementById("requestMessageButton");
		this.text = document.getElementById("textContainer");
		utils.addEventListener(this.button, "click", this.clickHandler.bind(this));
	},
	clickHandler: function() {
		this.dispatchEvent(new MessageEvent(MessageEvent.REQUEST));
	},
	updateMessage: function(message) {
		this.text.innerHTML = message;
	}
});
MessageView.NAME = "View::MessageView";
