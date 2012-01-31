NavigationView = soma.View.extend({
	id: null,
	currentSection: null,
	setup: function(id) {
		this.id = id;
		this.createLinks();
		this.select(NavigationConstants.ABOUT);
	},
	createLinks: function() {
		$(this.id + " li").click(this.clickHandler);
		$(this.id + " li a").removeAttr("href").css("cursor","pointer");
	},
	clickHandler: function() {
		var navigationId = $(this).attr('id').split("-")[1];
		this.dispatchEvent(new NavigationEvent(NavigationEvent.SELECT, navigationId))
		return false;
	},
	getListElement: function() {
		return $(this.id + ' li[id*="' + this.currentSection + '"]');
	},
	clear: function() {
		$(this.id + " li").css("font-weight", "normal");
	},
	highlight: function() {
		this.clear();
		this.getListElement().css("font-weight", "bold");
	},
	select: function(navigationId) {
		this.currentSection = navigationId;
		this.highlight();
	}
});
NavigationView.NAME = "View::NavigationView";

ChapterView = soma.View.extend({
	init: function() {
		this.name = this.domElement.id;
		var title = $(this.domElement).find("h2")[0];
		$(title).css("cursor", "pointer");
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
		this.code = $(this.domElement).find("textarea.code")[0];
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
		$(this.domElement).append('<button class="run">run code</button>');
		$(this.domElement).append('<button class="reset">reset code</button>');
		$(this.domElement).append('<button class="clear">clear log</button>');
		this.runButton = $(this.domElement).find(".run");
		this.resetButton = $(this.domElement).find(".reset");
		this.clearButton = $(this.domElement).find(".clear");
		$(this.runButton).click(this.runHandler.bind(this));
		$(this.resetButton).click(this.resetHandler.bind(this));
		$(this.clearButton).click(this.clearHandler.bind(this));
	},
	createLog: function() {
		$(this.domElement).append('<div class="log" style="border: 1px solid red"></div>');
		this.logElement = $(this.domElement).find(".log");
	},
	traceCode: function(value) {
		if (this.active) $(this.logElement).append(++this.count + ". " + value + "<br/>");
	},
	clearLog: function() {
		this.count = 0;
		$(this.logElement).html("");
	},
	runHandler: function(event) {
		console.log('RUN');
		this.clearLog();
		try {
			eval(this.editor.getValue());
		} catch (error) {
			this.traceCode(error);
		}
		return false;
	},
	clearHandler: function(event) {
		console.log('CLEAR');
		this.clearLog();
		return false;
	},
	resetHandler: function(event) {
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
	createNextButton: function() {
		$(this.domElement).append('<button class="next">next step</button>');
		this.nextButton = $(this.domElement).find(".next");
		$(this.nextButton).click(this.nextHandler.bind(this));
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

