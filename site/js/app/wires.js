ApplicationWire = soma.Wire.extend({
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
		$("#container").css("display", "block");
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

NavigationWire = soma.Wire.extend({
	navigationView: null,
	setup:function(message) {
		this.navigationView = this.addView(NavigationView.NAME, new NavigationView());
		this.navigationView.setup("nav");
	},
	select: function(navigationId) {
		this.navigationView.select(navigationId);
	},
	dispose: function() {
		this.navigationView = null;
	}
});
NavigationWire.NAME = "Wire::NavigationWire";

TutorialWire = soma.Wire.extend({
	section: null,
	chapters: null,
	init: function() {
		this.section = $("#tutorial")[0];
		this.chapters = $(this.section).find("section .chapter");
		this.chapters.each(this.createChapters).bind(this);
	},
	createChapters: function(index, value) {
		console.log(this, value.id);
		this.addWire(value.id, new ChapterWire(value.id));
		console.log(value.id);
		console.log(index, value);
	}
});
TutorialWire.NAME = "Wire::TutorialWire";

ChapterWire = soma.Wire.extend({
	init: function() {
		console.log(this.name);
	}
});
ChapterWire.NAME = "Wire::ChapterWire";







