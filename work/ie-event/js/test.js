var app = new soma.core.Application();

var COMMANDS_LIST = {
	My_EVENT: "myEvent"
};

var MyCommand = new Class({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		alert("execute command");
	}
});

app.addCommand(COMMANDS_LIST.My_EVENT, MyCommand);

var MyView = new Class({
	Extends: soma.View,
	button: null,
	init: function() {
		this.button = document.getElementById('bt');
		this.button.attachEvent('onclick', this.clickHandler.bind(this));
	},
	clickHandler: function(event) {
		this.dispatchEvent(new soma.Event(COMMANDS_LIST.My_EVENT));
	}
});

app.addView("myView", new MyView());


