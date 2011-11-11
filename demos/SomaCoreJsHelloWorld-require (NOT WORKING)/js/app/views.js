var MessageView = new Class({

	element:null,
	button:null,
	text:null,

	initialize: function() {
		this.element = document.getElementById("message");
		this.button = document.getElementById("requestMessageButton");
		this.text = document.getElementById("textContainer");
		console.log('init view:', this.element, this.button, this.text);
		this.setupUI();
	},

	setupUI: function() {
		console.log('setup ui');
		this.button.addEventListener("click", function() {
			console.log('click: ', this);
			this.dispatchEvent(new MessageEvent(MessageEvent.REQUEST));
		});
	},

    updateMessage: function(message) {
        console.log('update message in view: ', message);
        this.text.innerHTML = message;
    }

});
MessageView.NAME = "View::MessageView";