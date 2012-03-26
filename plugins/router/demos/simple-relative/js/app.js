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
	router: null,
	init:function() {
		// prepare routes
		var routes = {
			":nav" : SomaRouterEvent.NAV,
			":nav/:subnav" : SomaRouterEvent.SUB_NAV
		};
		// create plugin
		//this.router = this.createPlugin(SomaRouter, routes);
		this.router = this.createPlugin(SomaRouter);
		this.router.enableHashRouting({prefix:"!"});
		this.router.setGenerateRequestOnPageLoad(true);
		//
		console.log("getBaseHref", this.router.getBaseHref());
		routes[this.router.getBaseHref()] = SomaRouterEvent.ROOT;
		//

		this.router.app.get(':name/:nav', function (req) {
			console.log(":name " + req.params['name'])
		});



	}
});
RouterWire.NAME = "RouterWire";

var ContentWire = new soma.Wire.extend({
	init: function() {
		this.addEventListener(SomaRouterEvent.CHANGED, this.change.bind(this));
		this.addEventListener(SomaRouterEvent.ROOT, this.root.bind(this));
		this.addEventListener(SomaRouterEvent.NAV, this.mainNav.bind(this));
		this.addEventListener(SomaRouterEvent.SUB_NAV, this.subNav.bind(this));

		this.addEventListener(SomaRouterEvent.STARTED, this.started.bind(this));
		this.addEventListener(SomaRouterEvent.LOOKUP_ROUTE, this.eventHandler.bind(this));
		this.addEventListener(SomaRouterEvent.RUN_ROUTE, this.eventHandler.bind(this));
		this.addEventListener(SomaRouterEvent.ROUTE_NOT_FOUND, this.eventHandler.bind(this));
		this.addEventListener(SomaRouterEvent.REQUEST_HALTED, this.eventHandler.bind(this));
		this.addEventListener(SomaRouterEvent.UNSUPPORTED, this.eventHandler.bind(this));
	},
	started: function(event) {
		var router = this.getWire(RouterWire.NAME).router;
		console.log('start:', router.getBaseHref());

		var path = router.getCurrent();

		console.log("path:", path);

//		this.showNav(event.params['nav']);
//		this.showContent(event.params['nav']);
//		this.highlight(event.params['nav'], "");
	},
	eventHandler: function(event) {
		console.log('event.type:', event.type, event, Davis.location.current());

	},
	change: function(event) {
		console.log('change:', event.params.path, event);
		if (event.params.path == ":nav/:subnav") {
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