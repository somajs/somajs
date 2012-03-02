var HeaderView = new Class({

	Extends: soma.View,

	backButton: null,
	newButton: null,

	init: function() {
		this.backButton = document.getElementById("backButton");
		this.newButton = document.getElementById("newButton");
		this.createLinks();
		this.updateForList();
	},

	createLinks: function() {
		$(this.newButton).addEvent("click", this.newClickHandler.bind(this));
		$(this.backButton).addEvent("click", this.backClickHandler.bind(this));
	},

	newClickHandler: function() {
		this.dispatchEvent(new NoteEvent(NoteEvent.NEW));
	},

	backClickHandler: function() {
		this.dispatchEvent(new NoteEvent(NoteEvent.CANCEL));
	},

	updateForList: function() {
		this.backButton.style.display = "none";
		this.newButton.style.display = "block";
	},

	updateForDetails: function() {
		this.backButton.style.display = "block";
		this.newButton.style.display = "none";
	}

});
HeaderView.NAME = "View::HeaderView";
