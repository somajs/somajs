var SomaApplication = new soma.Application.extend({
	registerWires: function() {
		this.addWire(RouterWire.NAME, new RouterWire());
	}
});

var RouterWire = new soma.Wire.extend({
	router: null,
	init:function() {
		Davis.extend(Davis.hashRouting({prefix:"!"}))
		var routes = {
			"/" : this.root.bind(this),
			"/:nav" : this.mainNav.bind(this),
			"/:nav/:subnav" : this.subNav.bind(this)
		};
		this.router = this.createPlugin(SomaRouter, routes);
		//this.router.replaceAnchors("/");
		this.router.setGenerateRequestOnPageLoad(true);
		this.router.start();
		// styles
	},
	root: function(req) {
		console.log('root:');
		this.showNav();
		this.showContent("home");
		this.showStyle("");
	},
	mainNav: function(req) {
		console.log('main nav:', req.params['nav']);
		this.showNav(req.params['nav']);
		this.showContent(req.params['nav']);
		this.showStyle(req.params['nav'], "");
	},
	subNav: function(req) {
		console.log('sub nav:', req.params['nav'], req.params['subnav']);
		this.showNav(req.params['nav']);
		this.showContent(req.params['subnav']);
		this.showStyle(req.params['nav'], req.params['subnav']);
	},
	// styles
	showNav: function(nav) {
		if (nav == "articles") $("#subnav").show();
		else $("#subnav").hide();
	},
	showContent: function(nav) {
		$("#content div").hide();
		$("#" + nav).show();
	},
	showStyle: function(nav, subnav) {
		$("#nav a, #subnav a").removeClass("current");
		$('#nav a[href="/' + nav + '"]').addClass("current");
		$('#subnav a[href$="/' + subnav + '"]').addClass("current");
	}
});

var app = new SomaApplication();