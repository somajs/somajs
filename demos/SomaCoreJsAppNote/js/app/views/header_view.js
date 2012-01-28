var HeaderView = soma.View.extend({
	backButton: null,
	newButton: null,
	init: function() {
		this.backButton = document.getElementById("backButton");
		this.newButton = document.getElementById("newButton");
		this.createLinks();
		this.updateForList();
	},
	createLinks: function() {
		this.newButton.addEventListener("click", this.newClickHandler, false);
		this.backButton.addEventListener("click", this.backClickHandler, false);
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
