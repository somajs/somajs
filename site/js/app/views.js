NavigationView = soma.View.extend({
	currentSection: null,
	setup: function() {
		this.createLinks();
		this.select(NavigationConstants.ABOUT);
	},
	createLinks: function() {
		var i;
		var li = this.domElement.querySelectorAll("li");
		for (i=0; i<li.length; i++) utils.addEventListener(li[i], Detect.CLICK, this.clickHandler);
		var lia = this.domElement.querySelectorAll("li a");
		for (i=0; i<li.length; i++) {
			lia[i].removeAttribute("href");
			lia[i].style.cursor = "pointer";
		}
	},
	clickHandler: function(event) {
		event.stopPropagation();
		var navParts = this.id.split("-");
		var navigationId = navParts[1];
		switch (navParts[0]) {
			case "nav":
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, navigationId))
				break;
			case "chap":
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, navigationId));
				break;
		}
		return false;
	},
	getListElement: function(target) {
		return this.domElement.querySelector('li[id*="' + target + '"]');
	},
	clear: function() {
		var li = this.domElement.querySelectorAll("li");
		for (var i=0; i<li.length; i++) li[i].style.fontWeight = "normal";
	},
	clearTutorial: function() {
		var li = this.domElement.querySelectorAll('li[id*="chap"]');
		for (var i=0; i<li.length; i++) li[i].style.fontWeight = "normal";
	},
	highlight: function(target) {
		this.clear();
		this.getListElement(target).style.fontWeight = "bold";
	},
	highlightTutorial: function(target) {
		this.clearTutorial();
		this.getListElement(target).style.fontWeight = "bold";
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
		this.domElement.style.display = "block";
	},
	hide: function() {
		this.domElement.style.display = "none";
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
		this.logElement = utils.append(this.domElement, '<div class="log" style="border: 1px solid red"></div>');
	},
	traceCode: function(value) {
		if (this.active) {
			utils.append(this.logElement, ++this.count + ". " + value);
			utils.append(this.logElement, "<br/>");
		}
	},
	clearLog: function() {
		this.count = 0;
		this.logElement.innerHTML = "";
	},
	runHandler: function(event) {
		event.stopPropagation();
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
		console.log('CLEAR');
		this.clearLog();
		return false;
	},
	resetHandler: function(event) {
		event.stopPropagation();
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
		this.domElement.style.display = "block";
		this.refresh();
	},
	hide: function() {
		this.domElement.style.display = "none";
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

