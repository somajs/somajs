ApplicationWire = soma.Wire.extend({
	sections: null,
	init: function() {
		this.sections = [
			NavigationConstants.ABOUT,
			NavigationConstants.DOWNLOAD,
			NavigationConstants.TUTORIAL,
			NavigationConstants.BROWSERS,
			NavigationConstants.DEMOS,
			NavigationConstants.DOCS
		];
	},
	setup:function(message) {
		$("#container")[0].style.display = "block";
		this.monitorApplicationCreation();
		this.select(null);
	},
	monitorApplicationCreation: function() {
		// hack to cleanup applications created with codemirror
		window.listApp = [];
		var somaConstructor = soma.Application.prototype.constructor;
		soma.Application.prototype.constructor =  function() {
			somaConstructor.call(this);
			window.listApp.push(this);
		};
		soma.Application = soma.inherit(soma.EventDispatcher.extend(), soma.Application.prototype);
	},
	select: function(navigationId) {
		for (var i=0; i<this.sections.length; i++) {
			var el = $("#"+this.sections[i])[0];
			if (this.sections[i] == navigationId) $(el).removeClass("hidden");
			else $(el).addClass("hidden");
		}
	},
	dispose: function() {

	}
});
ApplicationWire.NAME = "Wire::ApplicationWire";

NavigationWire = soma.Wire.extend({
	navigationView: null,
	currentNavigation: null,
	setup:function(message) {
		this.navigationView = this.addView(NavigationView.NAME, new NavigationView($("#nav")[0]));
		this.navigationView.setup();
	},
	select: function(navigationId) {
		this.currentNavigation = navigationId;
		this.navigationView.select(navigationId);
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.NAVIGATION, "/" + navigationId));
	},
	selectTutorial: function(navigationId) {
		this.navigationView.selectTutorial(navigationId);
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.NAVIGATION, "/tutorials/" + navigationId));
	},
	dispose: function() {
		this.navigationView = null;
	}
});
NavigationWire.NAME = "Wire::NavigationWire";

TutorialWire = soma.Wire.extend({
	section: null,
	chapters: null,
	defaultChapter: null,
	currentChapter: null,
	init: function() {
		this.section = $("#tutorial")[0];
		this.chapters = $("section.chapter", this.section);
		utils.each(this.chapters, this.createChapter, this);
		this.addEventListener(ChapterEvent.ACTIVATE, this.activateHandler.bind(this));
		this.addEventListener(NavigationEvent.SELECTED, this.navigationSelectedHandler.bind(this));
	},
	createChapter: function(value, index) {
		if (index == 0) this.defaultChapter = value.id;
		this.addWire(value.id, new ChapterWire(value.id, value));
	},
	activateHandler: function(event) {
		this.currentChapter = event.params.chapterId;
		this.deactivateAllChapters(this.currentChapter);
	},
	navigationSelectedHandler: function(event) {
		if (event.params.navigationId == NavigationConstants.TUTORIAL) {
			this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, this.defaultChapter));
		}
	},
	deactivateAllChapters: function(exception) {
		for (var i=0; i<this.chapters.length; ++i) {
			if (this.chapters[i].id != exception){
				this.getWire(this.chapters[i].id).deactivate();
			}
		}
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
		if ($(this.chapter).hasClass("exercise")) {
			this.addModel(this.chapter.id, new ExerciseModel());
		}
		this.steps = $("section.step", this.chapter);
		utils.each(this.steps, this.createStep, this);
	},
	createStep: function(value, index) {
		var stepName = this.chapter.id + "-step-" + index;
		var wire = this.addWire(stepName, new StepWire(stepName, value));
		wire.setChapterId(this.chapter.id);
		if (index > 0) wire.createPreviousButton();
		if (index < this.steps.length-1) wire.createNextButton();
	},
	activate: function() {
		this.getView(this.chapter.id).activate();
		this.currentStep = 0;
		this.activateCurrentStep();
	},
	deactivate: function() {
		this.getView(this.chapter.id).deactivate();
		this.deactivateAllSteps();
	},
	activateCurrentStep: function() {
		var stepName = this.chapter.id + "-step-" + this.currentStep;
		if (this.hasWire(stepName)) {
			this.getWire(stepName).activate();
		}
		this.deactivateAllSteps(stepName);
	},
	deactivateAllSteps: function(exception) {
		for (var i=0; i<this.steps.length; ++i) {
			var stepName = this.chapter.id + "-step-" + i;
			if (stepName != exception){
				this.getWire(stepName).deactivate();
			}
		}
	},
	next: function() {
		this.currentStep++;
		this.activateCurrentStep();
	},
	previous: function() {
		this.currentStep--;
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
		if ($(this.step.parentNode).hasClass("exercise")) {
			this.stepView = this.addView(this.name, new StepExerciseView(this.step));
		}
		else {
			this.stepView = this.addView(this.name, new StepView(this.step));
		}
		this.stepView.name = this.name;
		this.addEventListener(NavigationEvent.SELECTED, this.navigationHandler.bind(this));
	},
	navigationHandler: function(event) {
		if (event.params.navigationId == NavigationConstants.TUTORIAL) {
			this.getView(this.name).refresh();
		}
	},
	activate: function() {
		if (this.hasModel(this.chapterId)) {
			this.stepView.setCode(this.getModel(this.chapterId).getRecord());
		}
		this.stepView.activate();
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.NAVIGATION, "/tutorial/" + this.chapterId + "/" + this.name));
	},
	deactivate: function() {
		this.stepView.deactivate();
	},
	createPreviousButton: function() {
		this.stepView.createPreviousButton();
	},
	createNextButton: function() {
		this.stepView.createNextButton();
	},
	setChapterId: function(id) {
		this.chapterId = id;
		this.stepView.setChapterId(id);
	}
});









