var NoteEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, note, noteTitle) {
		return this.parent(type, {note:note, noteTitle:noteTitle}, true, true );
	}

});
NoteEvent.INITIALIZE = "NoteEvent.INITIALIZE";
NoteEvent.CREATE = "NoteEvent.CREATE";
NoteEvent.DELETE = "NoteEvent.DELETE";
NoteEvent.EDIT = "NoteEvent.EDIT";
NoteEvent.CANCEL = "NoteEvent.CANCEL";
NoteEvent.NEW = "NoteEvent.NEW";

