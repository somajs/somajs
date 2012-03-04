var CaseCommand = new Class({
	Extends: soma.Command,
	execute: function(event) {
		switch (event.type) {
			case CaseEvent.CHANGE:
				this.getModel(InfoModel.NAME).changeCase();
				break;
		}
	}
});