var SomaApplication = new soma.Application.extend({
	registerWires: function() {
		this.addWire(ContentWire.NAME, new ContentWire());
		this.addWire(RouterWire.NAME, new RouterWire());
	}
});

var RouterEventTypes = {
	ROOT: "root",
	NAV: "nav",
	SUBNAV: "subnav"
};

var RouterWire = new soma.Wire.extend({
	init:function() {
		// prepare routes
		var routes = {
			"get": {
				"/" : RouterEventTypes.ROOT,
				"/:nav" : RouterEventTypes.NAV,
				"/:nav/:subnav" : RouterEventTypes.SUBNAV
			}
		};
		// add Davis hash plugin
		Davis.extend(Davis.hashRouting({ prefix: "!" }));
		// create plugin
		var router = this.createPlugin(SomaRouter, routes, function() {
			// Davis
			this.settings.generateRequestOnPageLoad = true;
			this.bind('start', function(req) {
				console.log("> start:", Davis.location.current());
			});
		});
	}
});
RouterWire.NAME = "RouterWire";

var ContentWire = new soma.Wire.extend({
	init: function() {
		this.addEventListener(SomaRouterEvent.CHANGED, this.changed.bind(this));
		this.addEventListener(RouterEventTypes.ROOT, this.root.bind(this));
		this.addEventListener(RouterEventTypes.NAV, this.nav.bind(this));
		this.addEventListener(RouterEventTypes.SUBNAV, this.subnav.bind(this));
	},
	changed: function(event) {
		// uncommented to disable all routes
		//event.preventDefault();
	},
	root: function(event) {
		this.showNav("home");
		this.showContent("home");
		this.highlight("home", "");
	},
	nav: function(event) {
		var request = event.params.request;
		this.showNav(request.params['nav']);
		this.showContent(request.params['nav']);
		this.highlight(request.params['nav'], "");
	},
	subnav: function(event) {
		var request = event.params.request;
		this.showNav(request.params['nav']);
		this.showContent(request.params['subnav']);
		this.highlight(request.params['nav'], request.params['subnav']);
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
