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
		this.main = this.domElement.querySelector("#main");
		this.mainList = this.domElement.querySelectorAll("#main>li");
		this.createLinks(this.mainList, this.clickMainHandler);
		this.tuto = this.domElement.querySelector("#tuto");
		this.tutoList = this.domElement.querySelectorAll("#tuto>li");
		this.createLinks(this.tutoList, this.clickTutoHandler);
	},
	createLinks: function(list, handler) {
		for (var i=0; i<list.length; i++) {
			utils.addEventListener(list[i], Detect.CLICK, handler);
			this.removeHref(list[i].querySelector("a"));
		}
	},
	removeHref: function(a) {
		a.removeAttribute("href");
		a.classList.add("pointer");
	},
	clickMainHandler: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, this.id.split("-")[1]))
		return false;
	},
	clickTutoHandler: function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, this.id.split("-")[1]))
		return false;
	},
	getListElement: function(target) {
		return this.domElement.querySelector('li[id*="' + target + '"]');
	},
	clear: function() {
		this.clearTutorial();
		for (var i=0; i<this.mainList.length; i++) this.mainList[i].classList.remove("selected");
	},
	clearTutorial: function() {
		for (var i=0; i<this.tutoList.length; i++) this.tutoList[i].classList.remove("selected");
	},
	highlight: function(target) {
		this.clear();
		this.getListElement(target).classList.add("selected");
	},
	highlightTutorial: function(target) {
		this.clearTutorial();
		this.getListElement(target).classList.add("selected");
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
		console.log('activate chapter view', this.name);
		this.show();
	},
	deactivate: function() {
		this.active = false;
		this.hide();
	},
	show: function() {
		this.domElement.classList.remove("hidden");
	},
	hide: function() {
		this.domElement.classList.add("hidden");
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
	init: function() {
		this.code = this.domElement.querySelector("textarea.code");
		if (this.code) {
			this.setSolution();
			this.createEditor();
			this.createButtons();
			this.createLog();
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
		this.resetButton = utils.append(this.domElement, '<a class="button icon loop reset">reset code</a>');
		this.clearButton = utils.append(this.domElement, '<a class="button icon remove clear">clear log</a>');
		utils.addEventListener(this.runButton, Detect.CLICK, this.runHandler.bind(this));
		utils.addEventListener(this.resetButton, Detect.CLICK, this.resetHandler.bind(this));
		utils.addEventListener(this.clearButton, Detect.CLICK, this.clearHandler.bind(this));
	},
	createLog: function() {
		this.logElement = utils.append(this.domElement, '<div class="log"></div>');
		this.checkLog();
	},
	checkLog: function() {
		this.logElement.classList[this.logElement.innerHTML==""?"add":"remove"]("hidden");
	},
	traceCode: function(value) {
		if (this.active) {
			utils.append(this.logElement, ++this.count + ". " + value);
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
		this.domElement.classList.remove("hidden");
		this.refresh();
	},
	hide: function() {
		this.domElement.classList.add("hidden");
	},
	createPreviousButton: function() {
		this.previousButton = utils.before(this.domElement, '<a class="button icon arrowleft previous">previous step</a>', this.code.parentNode);
		utils.addEventListener(this.previousButton, Detect.CLICK, this.previousHandler.bind(this));
	},
	createNextButton: function() {
		this.nextButton = utils.before(this.domElement, '<a class="button icon arrowright next">next step</a>', this.code.parentNode);
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

