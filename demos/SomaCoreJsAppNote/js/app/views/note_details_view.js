var NoteDetailsView = new Class({

	Extends: soma.View,

	saveButon: null,
	deleteButton: null,
	title: null,
	content: null,

	init: function() {
		this.hide();
		this.saveButton = document.getElementById("button-save");
		this.deleteButton = document.getElementById("button-delete");
		this.title = document.getElementById("form-title");
		this.content = document.getElementById("form-content");
		this.createLinks();
		this.createHints();
	},

	createLinks: function() {
		this.saveButton.addEventListener("click", this.saveClickHandler.bind(this));
		this.deleteButton.addEventListener("click", this.deleteClickHandler.bind(this));
	},

	createHints: function() {
		this.title.addEventListener("focus", this.titleFocusHandler);
		this.title.addEventListener("blur", this.titleBlurHandler);
		this.content.addEventListener("focus", this.contentFocusHandler);
		this.content.addEventListener("blur", this.contentBlurHandler);
	},

	titleFocusHandler: function() {
		console.log(1, this.value);
		if (this.value == "Title") this.value = "";
	},

	titleBlurHandler: function() {
		console.log(2, this.value);
		if (this.value == "") this.value = "Title";
	},

	contentFocusHandler: function() {
		if (this.value == "Content") this.value = "";
	},

	contentBlurHandler: function() {
		if (this.value == "") this.value = "Content";
	},

	saveClickHandler: function() {
		var newNote = new NoteVO(this.title.value, this.content.value);
		this.dispatchEvent(new NoteEvent(NoteEvent.CREATE, newNote));
	},

	deleteClickHandler: function() {
		this.dispatchEvent(new NoteEvent(NoteEvent.DELETE, null, this.title.value));
	},

	show: function() {
		this.domElement.style.display = "block";
		this.deleteButton.parentNode.style.display = "block";
	},

	hide: function() {
		this.domElement.style.display = "none";
	},

	hideDelete: function() {
		this.deleteButton.parentNode.style.display = "none";
	},

	update: function(note) {
		console.log(note);
		this.title.value = note.title;
		this.content.value = note.content;
	},

	clear: function() {
		this.title.value = "Title";
		this.content.value = "Content";
	}

});
NoteListView.NAME = "View::NoteDetailsView";
