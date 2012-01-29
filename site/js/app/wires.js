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
		this.chapters.each(this.createChapter.bind(this));
	},
	createChapter: function(index, value) {
		this.addWire(value.id, new ChapterWire(value.id, value));
	}
});
TutorialWire.NAME = "Wire::TutorialWire";

ChapterWire = soma.Wire.extend({
	chapter: null,
	steps: null,
	currentStep: 0,
	constructor: function(name, chapter) {
		this.chapter = chapter;
		soma.Wire.call(this, name);
	},
	init: function() {
		this.addView(this.chapter.id, new ChapterView(this.chapter));
		this.steps = $(this.chapter).find("section .step");
		this.steps.each(this.createStep.bind(this));
		this.createLink();
	},
	createStep: function(index, value) {
		var stepName = this.chapter.id + "-step-" + index;
		var wire = this.addWire(stepName, new StepWire(stepName, value));
		wire.setChapterId(this.chapter.id);
		if (index < this.steps.length-1) wire.createNextButton();
	},
	createLink: function() {
		$(this.chapter).find("h2").click(this.clickHandler.bind(this));
	},
	clickHandler: function(event) {
		this.activate();
	},
	activate: function() {
		this.currentStep = 0;
		this.activateCurrentStep();
	},
	activateCurrentStep: function() {
		this.deactivateAllSteps();
		var stepName = this.chapter.id + "-step-" + this.currentStep;
		if (this.hasWire(stepName)) {
			console.log('activate chapter', this.chapter.id);
			this.getWire(stepName).activate();
		}
	},
	deactivateAllSteps: function() {
		this.steps.each(this.deactivateStep.bind(this));
	},
	deactivateStep: function(index, value) {
		var stepName = this.chapter.id + "-step-" + index;
		this.getWire(stepName).deactivate();
	},
	next: function() {
		this.currentStep++;
		this.activateCurrentStep();
	}
});

StepWire = soma.Wire.extend({
	step: null,
	code: null,
	editor: null,
	stepView: null,
	chapterId: null,
	constructor: function(name, step) {
		this.step = step;
		soma.Wire.call(this, name);
	},
	init: function() {
		this.stepView = this.addView(this.name, new StepView(this.step));
		this.stepView.name = this.name;
		this.addEventListener(NavigationEvent.SELECT, this.navigationHandler.bind(this));
	},
	navigationHandler: function(event) {
		if (event.params.navigationId == NavigationConstants.TUTORIAL) {
			this.getView(this.name).refresh();
		}
	},
	activate: function() {
		console.log('activate step', this.name);
		this.stepView.activate();
	},
	deactivate: function() {
		this.stepView.deactivate();
	},
	createNextButton: function() {
		this.stepView.createNextButton();
	},
	setChapterId: function(id) {
		this.chapterId = id;
		this.stepView.setChapterId(id);
	}
});









