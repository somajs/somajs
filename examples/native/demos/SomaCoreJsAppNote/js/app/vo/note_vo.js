var NoteVO = function(title, content){
	this.title = title;
	this.content = content;
};
NoteVO.prototype = {
	title: null,
	content: null,
	toString: function() {
		return "[NoteVO] title: " + this.title + ", content: " + this.content;
	}
};
