var SomaApplication = soma.Application.extend({
	registerCommands: function() {
		this.addCommand(NoteEvent.INITIALIZE, NoteCommand);
		this.addCommand(NoteEvent.CREATE, NoteCommand);
		this.addCommand(NoteEvent.DELETE, NoteCommand);
		this.addCommand(NoteEvent.EDIT, NoteCommand);
		this.addCommand(NoteEvent.CANCEL, NoteCommand);
		this.addCommand(NoteEvent.NEW, NoteCommand);
	},
	registerModels: function() {
		this.addModel(NoteModel.NAME, new NoteModel());
	},
	registerViews: function() {
		this.addView(HeaderView.NAME, new HeaderView(document.getElementById("header")));
		this.addView(NoteListView.NAME, new NoteListView(document.getElementById("screen-list")));
		this.addView(NoteDetailsView.NAME, new NoteDetailsView(document.getElementById("screen-details")));
	},
	start: function() {
		this.dispatchEvent(new NoteEvent(NoteEvent.INITIALIZE));
	}
});
var app = new SomaApplication();
