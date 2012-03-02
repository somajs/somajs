var NoteModel = new Class({

	init: function() {
		if (!this.hasStorage()) {
			alert("Your browser does not support local storage!");
		}
	},

	hasStorage: function() {
		try {
			localStorage.setItem("AppNoteTest", "AppNoteTest");
			localStorage.removeItem("AppNoteTest");
			return true;
		} catch(e) {
			return false;
		}
	},

	createNote: function(vo) {
		try {
			localStorage.setItem(vo.title, vo.content);
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
				alert('Quota exceeded!');
			}
		}
	},

	deleteNote: function(title) {
		localStorage.removeItem(title);
	},

	getNote: function(title) {
		return new NoteVO(title, localStorage.getItem(title));
	},

	getAllNotes: function() {
		var list = [];
		for (var i = 0; i < localStorage.length; i++){
			var title = localStorage.key(i);
			var content = localStorage.getItem(title);
			list.push(new NoteVO(title, content));
		}
		return list;
	}

});
NoteModel.NAME = "Model::NoteModel";
