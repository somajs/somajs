NavigationView = soma.View.extend({
	currentSection: null,
	main: null,
	mainList: null,
	tuto: null,
	tutoList: null,
	setup: function() {
		this.setup();
		this.select(NavigationConstants.ABOUT);
	},
	setup: function() {
		this.main = $("#main", this.domElement)[0];
		this.mainList = $('#main').children(':not([class="external"])');
		this.createLinks(this.mainList, this.clickMainHandler);
		this.tuto = $("#tuto", this.domElement)[0];
		this.tutoList = $(this.tuto).children();
		this.createLinks(this.tutoList, this.clickTutoHandler);
	},
	createLinks: function(list, handler) {
		var self = this;
		for (var i=0; i<list.length; i++) {
			var a = $("a", list[i])[0];
			this.removeHref(a);
			$(a).bind(Detect.CLICK, {id: $(a).parent()[0].id.split("-")[1]}, handler.bind(this));
		}
	},
	removeHref: function(a) {
		$(a).removeAttr("href");
		$(a).addClass("pointer");
	},
	clickMainHandler: function(event) {
		if (event.stopPropagation) if (event.stopPropagation) event.stopPropagation();
		if (event.preventDefault) event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, event.data.id));
		return false;
	},
	clickTutoHandler: function(event) {
		if (event.stopPropagation) if (event.stopPropagation) event.stopPropagation();
		if (event.preventDefault) event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, event.data.id));
		return false;
	},
	getListElement: function(target) {
		return $('li[id*="' + target + '"]', this.domElement)[0];
	},
	removeClassSelected: function(value, index) {
		$(value).removeClass("selected");
	},
	clear: function() {
		this.clearTutorial();
		utils.each(this.mainList, this.removeClassSelected);
	},
	clearTutorial: function() {
		utils.each(this.tutoList, this.removeClassSelected);
	},
	highlight: function(target) {
		this.clear();
		$(this.getListElement(target)).addClass("selected");
	},
	highlightTutorial: function(target) {
		this.clearTutorial();
		$(this.getListElement(target)).addClass("selected");
	},
	select: function(navigationId) {
		this.currentSection = navigationId;
		this.highlight(this.currentSection);
	},
	selectTutorial: function(navigationId) {
		this.highlight(NavigationConstants.TUTORIAL);
		this.highlightTutorial(navigationId);
	}
});
NavigationView.NAME = "View::NavigationView";

ChapterView = soma.View.extend({
	active: false,
	init: function() {
		this.name = this.domElement.id;
		this.deactivate();
	},
	activate: function() {
		this.active = true;
		this.show();
	},
	deactivate: function() {
		this.active = false;
		this.hide();
	},
	show: function() {
		$(this.domElement).removeClass("hidden");
	},
	hide: function() {
		$(this.domElement).addClass("hidden");
	}
});

StepView = soma.View.extend({
	code: null,
	editor: null,
	runButton: null,
	clearButton: null,
	resetButton: null,
	nextButton: null,
	logElement: null,
	count: 0,
	active: false,
	chapterId: null,
	stepNav: null,
	resetLabel: "reset code",
	init: function() {
		this.code = $("textarea.code", this.domElement)[0];
		if (this.code) {
			this.setSolution();
			this.createEditor();
			this.createButtons();
			this.createLog();
			this.createNavContainer();
			this.hide();
		}
	},
	setSolution: function() {
		this.solution = this.code.value;
	},
	createEditor: function() {
		this.editor = CodeMirror.fromTextArea(this.code, {
			mode: "javascript",
			theme: "eclipse",
			lineNumbers: true,
			height: "dynamic"
		});
	},
	createButtons: function() {
		this.runButton = utils.append(this.domElement, '<a class="button icon clock run">run code</a>');
		this.resetButton = utils.append(this.domElement, '<a class="button icon loop reset">' + this.resetLabel +'</a>');
		this.clearButton = utils.append(this.domElement, '<a class="button icon remove clear">clear log</a>');
		$(this.runButton).bind(Detect.CLICK, this.runHandler.bind(this));
		$(this.resetButton).bind(Detect.CLICK, this.resetHandler.bind(this));
		$(this.clearButton).bind(Detect.CLICK, this.clearHandler.bind(this));
	},
	createLog: function() {
		this.logElement = utils.append(this.domElement, '<div class="log"></div>');
		this.checkLog();
	},
	createNavContainer: function() {
		this.stepNav = utils.append(this.domElement, '<div class="step-nav"></div>');
	},
	checkLog: function() {
		if (this.logElement.innerHTML=="") $(this.logElement).addClass("hidden");
		else $(this.logElement).removeClass("hidden");
	},
	traceCode: function(value) {
		if (this.active) {
			utils.append(this.logElement, '<span><span class="log-count">' + ++this.count + ".</span> " + value + "</span>");
			utils.append(this.logElement, "<br/>");
			this.checkLog();
		}
	},
	clearLog: function() {
		this.count = 0;
		this.logElement.innerHTML = "";
		this.checkLog();
	},
	runHandler: function(event) {
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.BUTTON, "run"));
		if (event.stopPropagation) event.stopPropagation();
		event.preventDefault();
		this.clearLog();
		try {
			window.log = this.traceCode.bind(this);
			eval(this.editor.getValue());
			window.log = function(){};
			this.dispatchEvent(new ApplicationEvent(ApplicationEvent.CLEANUP));
			window.log = null;
		} catch (error) {
			this.traceCode(error);
		}
		return false;
	},
	clearHandler: function(event) {
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.BUTTON, "clear"));
		if (event.stopPropagation) event.stopPropagation();
		event.preventDefault();
		this.clearLog();
		return false;
	},
	resetHandler: function(event) {
		this.dispatchEvent(new TrackingEvent(TrackingEvent.SEND, TrackingConstants.BUTTON, "reset/solution"));
		if (event.stopPropagation) event.stopPropagation();
		event.preventDefault();
		this.editor.setValue(this.solution);
		return false;
	},
	refresh:function() {
		this.editor.refresh();
	},
	activate: function() {
		this.active = true;
		this.show();
	},
	deactivate: function() {
		window.log = null;
		this.active = false;
		this.hide();
	},
	show: function() {
		$(this.domElement).removeClass("hidden");
		this.refresh();
	},
	hide: function() {
		$(this.domElement).addClass("hidden");
	},
	createPreviousButton: function() {
		this.previousButton = utils.append(this.stepNav, '<a class="button icon arrowleft previous">previous step</a>');
		$(this.previousButton).bind(Detect.CLICK, this.previousHandler.bind(this));
	},
	createNextButton: function() {
		this.nextButton = utils.append(this.stepNav, '<a class="button icon arrowright next">next step</a>');
		$(this.nextButton).bind(Detect.CLICK, this.nextHandler.bind(this));
	},
	previousHandler: function(event) {
		this.dispatchEvent(new ChapterEvent(ChapterEvent.PREVIOUS, this.chapterId));
		if (event.stopPropagation) event.stopPropagation();
		return false;
	},
	nextHandler: function(event) {
		this.dispatchEvent(new ChapterEvent(ChapterEvent.NEXT, this.chapterId));
		if (event.stopPropagation) event.stopPropagation();
		return false;
	},
	setChapterId: function(id) {
		this.chapterId = id;
	}
});

var StepExerciseView = StepView.extend({
	init: function() {
		this.resetLabel = "see solution";
		StepView.prototype.init.call(this);
	},
	setCode: function(value) {
		this.editor.setValue(value);
	},
	record: function() {
		if (this.active) this.dispatchEvent(new ExerciseEvent(ExerciseEvent.RECORD, this.chapterId, this.editor.getValue()));
	},
	previousHandler: function(event) {
		this.record();
		StepView.prototype.previousHandler.call(this, event);
	},
	nextHandler: function(event) {
		this.record();
		StepView.prototype.nextHandler.call(this, event);
	},
	activate: function() {
		this.logElement.id = "log";
		StepView.prototype.activate.call(this);
	},
	deactivate: function() {
		this.logElement.id = "";
		this.record();
		StepView.prototype.deactivate.call(this);
	}
});
