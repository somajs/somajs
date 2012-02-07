NavigationView = soma.View.extend({
	id: null,
	currentSection: null,
	setup: function(id) {
		this.id = id;
		this.createLinks();
		this.select(NavigationConstants.ABOUT);
	},
	createLinks: function() {
		$(this.id + " li").bind(Detect.CLICK, this.clickHandler);
		$(this.id + " li a").removeAttr("href").css("cursor","pointer");
	},
	clickHandler: function() {
		event.stopPropagation();
		var navParts = $(this).attr('id').split("-");
		var navigationId = navParts[1];
		switch (navParts[0]) {
			case "nav":
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, navigationId))
				break;
			case "chap":
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, NavigationConstants.TUTORIAL))
				this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT_TUTORIAL, navigationId));
				break;
		}
		return false;
	},
	getListElement: function(target) {
		return $(this.id + ' li[id*="' + target + '"]');
	},
	clear: function() {
		$(this.id + " li").css("font-weight", "normal");
	},
	clearTutorial: function() {
		$(this.id + ' li[id*="chap"]').css("font-weight", "normal");
	},
	highlight: function() {
		this.clear();
		this.getListElement(this.currentSection).css("font-weight", "bold");
	},
	highlightTutorial: function(target) {
		this.clearTutorial();
		this.getListElement(target).css("font-weight", "bold");
	},
	select: function(navigationId) {
		this.currentSection = navigationId;
		this.highlight();
	},
	selectTutorial: function(navigationId) {
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
		console.log('activate view', this.name);
		this.show();
	},
	deactivate: function() {
		this.active = false;
		this.hide();
	},
	show: function() {
		$(this.domElement).css("display", "block");
	},
	hide: function() {
		$(this.domElement).css("display", "none");
	},
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
		this.code = $("textarea.code", $(this.domElement))[0];
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
		$(this.domElement).append('<a class="button icon clock run">run code</a>');
		$(this.domElement).append('<a class="button icon loop reset">reset code</a>');
		$(this.domElement).append('<a class="button icon remove clear">clear log</a>');
		this.runButton = $(".run", $(this.domElement));
		this.resetButton = $(".reset", $(this.domElement));
		this.clearButton = $(".clear", $(this.domElement));
		$(this.runButton).bind(Detect.CLICK, this.runHandler.bind(this));
		$(this.resetButton).bind(Detect.CLICK, this.resetHandler.bind(this));
		$(this.clearButton).bind(Detect.CLICK, this.clearHandler.bind(this));
	},
	createLog: function() {
		$(this.domElement).append('<div class="log" style="border: 1px solid red"></div>');
		this.logElement = $(".log", $(this.domElement));
	},
	traceCode: function(value) {
		if (this.active) $(this.logElement).append(++this.count + ". " + value + "<br/>");
	},
	clearLog: function() {
		this.count = 0;
		$(this.logElement).html("");
	},
	runHandler: function(event) {
		event.stopPropagation();
		console.log('RUN');
		this.clearLog();
		try {
			this.dispatchEvent(new ApplicationEvent(ApplicationEvent.CLEANUP));
			eval(this.editor.getValue());
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
		console.log('activate view', this.name);
		log = this.traceCode.bind(this);
		this.show();
	},
	deactivate: function() {
		this.active = false;
		this.hide();
	},
	show: function() {
		$(this.domElement).css("display", "block");
		this.refresh();
	},
	hide: function() {
		$(this.domElement).css("display", "none");
	},
	createPreviousButton: function() {
		$("div.code", $(this.domElement)).before('<a class="button icon arrowleft previous">previous step</a>');
		this.previousButton = $(".previous", $(this.domElement));
		$(this.previousButton).bind(Detect.CLICK, this.previousHandler.bind(this));
	},
	createNextButton: function() {
		$("div.code", $(this.domElement)).before('<a class="button icon arrowright next">next step</a>');
		this.nextButton = $(".next", $(this.domElement));
		$(this.nextButton).bind(Detect.CLICK, this.nextHandler.bind(this));
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

