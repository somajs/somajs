var CaseCommand = soma.Command.extend({
	execute: function(event) {
		switch (event.type) {
			case CaseEvent.CHANGE:
				this.getModel(InfoModel.NAME).changeCase();
				break;
		}
	}
});