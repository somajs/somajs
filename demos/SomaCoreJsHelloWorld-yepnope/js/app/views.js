var MessageView = new Class({

	element:null,
	button:null,
	text:null,

	initialize: function() {
		this.element = document.getElementById("message");
		this.button = document.getElementById("requestMessageButton");
		this.text = document.getElementById("textContainer");
		this.setupUI();
	},

	setupUI: function() {
		this.button.addEventListener("click", function() {
			this.dispatchEvent(new MessageEvent(MessageEvent.REQUEST));
		});
	},

    updateMessage: function(message) {
        this.text.innerHTML = message;
    }

});
MessageView.NAME = "View::MessageView";
