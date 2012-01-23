var NoteCommand = new Class({

	Extends: soma.core.controller.Command,

	execute: function(event) {
		var model = this.getModel(NoteModel.NAME);
		var headerView = this.getView(HeaderView.NAME);
		var listView = this.getView(NoteListView.NAME);
		var detailsView = this.getView(NoteDetailsView.NAME);
		switch (event.type) {
			case NoteEvent.INITIALIZE:
				listView.updateList(model.getAllNotes());
				break;
			case NoteEvent.NEW:
				detailsView.clear();
				detailsView.show();
				detailsView.hideDelete();
				listView.hide();
				headerView.updateForDetails();
				break;
			case NoteEvent.CREATE:
				model.createNote(event.params.note);
				listView.updateList(model.getAllNotes());
				detailsView.clear();
				detailsView.hide();
				listView.show();
				headerView.updateForList();
				break;
			case NoteEvent.DELETE:
				model.deleteNote(event.params.noteTitle);
				listView.updateList(model.getAllNotes());
				detailsView.hide();
				listView.show();
				headerView.updateForList();
				break;
			case NoteEvent.EDIT:
				console.log("edit", event.params.noteTitle);
				listView.hide();
				var note = model.getNote(event.params.noteTitle);
				detailsView.update(note);
				detailsView.show();
				headerView.updateForDetails();
				break;
			case NoteEvent.CANCEL:
				detailsView.hide();
				listView.show();
				headerView.updateForList();
				break;
		}
	}

});