var SomaApplication = soma.Application.extend({

	registerCommands: function() {
		this.addCommand(CaseEvent.CHANGE, CaseCommand);
	},

	registerModels: function() {
		this.addModel(InfoModel.NAME, new InfoModel(document.getElementById("list")));
	},

	registerViews: function() {
		this.addView(InfoView.NAME, new InfoView(document.getElementById("buttons")));
	}

});

var app = new SomaApplication();