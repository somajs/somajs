var MessageView = function(){
	this.element = document.getElementById("message");
	this.button = document.getElementById("requestMessageButton");
	this.text = document.getElementById("textContainer");
	this.setupUI();
};
MessageView.prototype = {
	element:null,
	button:null,
	text:null,
	setupUI: function() {
		this.button.addEventListener("click", function() {
			this.dispatchEvent(new MessageEvent(MessageEvent.REQUEST));
		}, false);
	},

	updateMessage: function(message) {
		this.text.innerHTML = message;
	}
}
MessageView.NAME = "View::MessageView";
