var NoteEvent = soma.Event.extend({
	constructor: function(type, note, noteTitle) {
		return soma.Event.call(this, type, {note:note, noteTitle:noteTitle}, true, true);
	}
});
NoteEvent.INITIALIZE = "NoteEvent.INITIALIZE";
NoteEvent.CREATE = "NoteEvent.CREATE";
NoteEvent.DELETE = "NoteEvent.DELETE";
NoteEvent.EDIT = "NoteEvent.EDIT";
NoteEvent.CANCEL = "NoteEvent.CANCEL";
NoteEvent.NEW = "NoteEvent.NEW";

