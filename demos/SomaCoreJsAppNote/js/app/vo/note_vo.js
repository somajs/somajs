var NoteVO = new Class({

	title: null,
	content: null,

	initialize: function(title, content) {
		this.title = title;
		this.content = content;
		return this;
	},

	toString: function() {
		return "[NoteVO] title: " + this.title + ", content: " + this.content;
	}

});
