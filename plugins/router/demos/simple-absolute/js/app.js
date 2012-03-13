SomaRouterEvent.ROOT = "rootEvent";
SomaRouterEvent.NAV = "navEvent";
SomaRouterEvent.SUB_NAV = "subnavEvent";

var SomaApplication = new soma.Application.extend({
	registerWires: function() {
		this.addWire(ContentWire.NAME, new ContentWire());
		this.addWire(RouterWire.NAME, new RouterWire());
	},
	start: function() {
		this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.START));
//		this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.STOP));
	}
});

var RouterWire = new soma.Wire.extend({
	init:function() {
		// prepare routes
		var routes = {
			"/" : SomaRouterEvent.ROOT,
			"/:nav" : SomaRouterEvent.NAV,
			"/:nav/:subnav" : SomaRouterEvent.SUB_NAV
		};
		// create plugin
		var router = this.createPlugin(SomaRouter, routes);
		router.enableHashRouting({prefix:"!"});
		router.setGenerateRequestOnPageLoad(true);
	}
});
RouterWire.NAME = "RouterWire";

var ContentWire = new soma.Wire.extend({
	init: function() {
		this.addEventListener(SomaRouterEvent.CHANGED, this.change.bind(this));
		this.addEventListener(SomaRouterEvent.ROOT, this.root.bind(this));
		this.addEventListener(SomaRouterEvent.NAV, this.mainNav.bind(this));
		this.addEventListener(SomaRouterEvent.SUB_NAV, this.subNav.bind(this));
		console.log(SomaRouterEvent.ROOT);
	},
	change: function(event) {
		console.log('change:', event.params.path, event);
		if (event.params.path == "/:nav/:subnav") {
			//event.preventDefault();
		}
	},
	root: function(event) {
		console.log('root:', event);
		this.showNav();
		this.showContent("home");
		this.highlight("");
	},
	mainNav: function(event) {
		console.log('main nav:', event.params['nav']);
		this.showNav(event.params['nav']);
		this.showContent(event.params['nav']);
		this.highlight(event.params['nav'], "");
	},
	subNav: function(event) {
		console.log('sub nav:', event.params['nav'], event.params['subnav']);
		this.showNav(event.params['nav']);
		this.showContent(event.params['subnav']);
		this.highlight(event.params['nav'], event.params['subnav']);
	},
	showNav: function(nav) {
		if (nav == "articles") $("#subnav").show();
		else $("#subnav").hide();
	},
	showContent: function(nav) {
		$("#content div").hide();
		$("#" + nav).show();
	},
	highlight: function(nav, subnav) {
		$("#nav a, #subnav a").removeClass("current");
		$('#nav a[href="/' + nav + '"]').addClass("current");
		$('#subnav a[href$="/' + subnav + '"]').addClass("current");
	}
});
ContentWire.NAME = "ContentWire";

var app = new SomaApplication();