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
		this.main = qwery("#main", this.domElement)[0];
		this.mainList = qwery('li:not([class="external"])', this.main);
		this.createLinks(this.mainList, this.clickMainHandler);
		this.tuto = qwery("#tuto", this.domElement)[0];
		this.tutoList = qwery("li", this.tuto);
		this.createLinks(this.tutoList, this.clickTutoHandler);
	},
	createLinks: function(list, handler) {
		for (var i=0; i<list.length; i++) {
			var a = qwery("a", list[i])[0];
			utils.addEventListener(a, Detect.CLICK, handler);
			this.removeHref(a);
		}
	},
	removeHref: function(a) {
		a.removeAttribute("href");
		utils.addClass(a, "pointer");
	},
	clickMainHandler: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, this.parentNode.id.split("-")[1]));
		return false;
	},
	clickTutoHandler: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, this.parentNode.id.split("-")[1]));
		return false;
	},
	getListElement: function(target) {
		console.log(target);
		console.log(qwery('li[id*="' + target + '"]', this.domElement)[0]);
		return qwery('li[id*="' + target + '"]', this.domElement)[0];
	},
	removeClassSelected: function(value, index) {
		utils.removeClass(value, "selected");
	},
	clear: function() {
		this.clearTutorial();
		utils.each(this.mainList, this.removeClassSelected);
	},
	clearTutorial: function() {
		utils.each(this.tutoList, this.removeClassSelected);
	},
	highlight: function(target) {
		console.log(this.domElement.id);
		this.clear();
		utils.addClass(this.getListElement(target), "selected");
	},
	highlightTutorial: function(target) {
		this.clearTutorial();
		utils.addClass(this.getListElement(target), "selected");
	},
	select: function(navigationId) {
		console.log(navigationId);
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
		console.log('activate chapter view', this.name);
		this.show();
	},
	deactivate: function() {
		this.active = false;
		this.hide();
	},
	show: function() {
		utils.removeClass(this.domElement, "hidden");
	},
	hide: function() {
		utils.addClass(this.domElement, "hidden");
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
		this.code = qwery("textarea.code", this.domElement)[0];
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
		utils.addEventListener(this.runButton, Detect.CLICK, this.runHandler.bind(this));
		utils.addEventListener(this.resetButton, Detect.CLICK, this.resetHandler.bind(this));
		utils.addEventListener(this.clearButton, Detect.CLICK, this.clearHandler.bind(this));
	},
	createLog: function() {
		this.logElement = utils.append(this.domElement, '<div class="log"></div>');
		this.checkLog();
	},
	createNavContainer: function() {
		this.stepNav = utils.append(this.domElement, '<div class="step-nav"></div>');
	},
	checkLog: function() {
		if (this.logElement.innerHTML=="") utils.addClass(this.logElement, "hidden");
		else utils.removeClass(this.logElement, "hidden");
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
		event.stopPropagation();
		event.preventDefault();
		console.log('RUN');
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
		event.stopPropagation();
		event.preventDefault();
		console.log('CLEAR');
		this.clearLog();
		return false;
	},
	resetHandler: function(event) {
		event.stopPropagation();
		event.preventDefault();
		console.log('RESET');
		this.editor.setValue(this.solution);
		return false;
	},
	refresh:function() {
		this.editor.refresh();
	},
	activate: function() {
		this.active = true;
		console.log('activate step view', this.name);
		this.show();
	},
	deactivate: function() {
		window.log = null;
		this.active = false;
		this.hide();
	},
	show: function() {
		utils.removeClass(this.domElement, "hidden");
		this.refresh();
	},
	hide: function() {
		utils.addClass(this.domElement, "hidden");
	},
	createPreviousButton: function() {
		this.previousButton = utils.append(this.stepNav, '<a class="button icon arrowleft previous">previous step</a>');
		utils.addEventListener(this.previousButton, Detect.CLICK, this.previousHandler.bind(this));
	},
	createNextButton: function() {
		this.nextButton = utils.append(this.stepNav, '<a class="button icon arrowright next">next step</a>');
		utils.addEventListener(this.nextButton, Detect.CLICK, this.nextHandler.bind(this));
	},
	previousHandler: function(event) {
		this.dispatchEvent(new ChapterEvent(ChapterEvent.PREVIOUS, this.chapterId));
		event.stopPropagation();
		return false;
	},
	nextHandler: function(event) {
		this.dispatchEvent(new ChapterEvent(ChapterEvent.NEXT, this.chapterId));
		event.stopPropagation();
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
		console.log('id:', this.logElement.id, this.logElement);
		StepView.prototype.activate.call(this, event);
	},
	deactivate: function() {
		this.logElement.id = "";
		this.record();
		StepView.prototype.deactivate.call(this, event);
	}
});
