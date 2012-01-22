ApplicationWire = new Class({

	Extends: soma.core.wire.Wire,

	sections: null,

	init: function() {
		this.sections = [
			NavigationConstants.ABOUT,
			NavigationConstants.DOWNLOAD,
			NavigationConstants.TUTORIAL,
			NavigationConstants.DOC
		];
	},

	setup:function(message) {
		this.select(NavigationConstants.ABOUT);
	},

	select: function(navigationId) {
		$.each(this.sections, function(index, value) {
			$("#"+value).css("display", (value == navigationId) ? "block" : "none");
		})
	},

	dispose: function() {

	}

});
ApplicationWire.NAME = "Wire::ApplicationWire";

NavigationWire = new Class({

	Extends: soma.core.wire.Wire,

	navigationView: null,

	init: function() {
		
	},

	setup:function(message) {
		this.navigationView = this.addView(NavigationView.NAME, new NavigationView());
		this.navigationView.setup("nav");
	},

	select: function(navigationId) {
		$("#log").append("nav select: " + navigationId + "<br/>");
		this.navigationView.select(navigationId);
	},

	dispose: function() {
		this.navigationView = null;
	}

});
NavigationWire.NAME = "Wire::NavigationWire";
