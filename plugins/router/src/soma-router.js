var SomaRouter = soma.extend({
	instance: null,
	wire:null,
	app: null,
	constructor: function(instance, routes) {
		this.instance = instance;
		console.log('soma state constructor');
		this.wire = this.instance.addWire(SomaRouterWire.NAME, new SomaRouterWire());
		this.wire.create();
		this.app = this.wire.app;
		if (routes) this.wire.setConfig(routes);
	},
	setConfig: function(routes) {
		this.wire.setConfig(routes);
	},
	dispose: function() {
		this.instance.removeWire(SomaRouterWire.NAME);
		instance = null;
	},
	getBaseHref: function() {
		return $('base').attr("href");
	},
	replaceAnchors: function(replacement) {
		$('a[href^="#"]').each(function(index, value) {
			var href = $(value).attr("href").toString().replace("#", replacement);
			$(value).attr("href", href);
		});
	},
	getBaseHref: function() {
		return $('base').attr("href");
	},
	setLinkSelector: function(value) {
		this.wire.setLinkSelector(value);
	},
	setFormSelector: function(value) {
		this.wire.setFormSelector(value);
	},
	setThrowErrors: function(value) {
		this.wire.setThrowErrors(value);
	},
	setHandleRouteNotFound: function(value) {
		this.wire.setHandleRouteNotFound(value);
	},
	setGenerateRequestOnPageLoad: function(value) {
		this.wire.setGenerateRequestOnPageLoad(value);
	},
	start: function() {
		this.wire.start();
	},
	stop: function() {
		this.wire.stop();
	}
});

var SomaRouterWire = soma.Wire.extend({
	app: null,
	init: function() {

	},
	dispose: function() {
		this.app.stop();
		this.app = null;
	},
	create: function() {
		this.app = Davis();
	},
	start: function() {
		this.app.start();
	},
	stop: function() {
		this.app.stop();
	},
	setConfig: function(routes) {
		for (var r in routes) {
			console.log('add route', r, routes[r]);
			this.app.get(r, routes[r]);
		}
	},
	setLinkSelector: function(value) {
		this.app.settings.linkSelector = value;
	},
	setFormSelector: function(value) {
		this.app.settings.formSelector = value;
	},
	setThrowErrors: function(value) {
		this.app.settings.throwErrors = value;
	},
	setHandleRouteNotFound: function(value) {
		this.app.settings.handleRouteNotFound = value;
	},
	setGenerateRequestOnPageLoad: function(value) {
		this.app.settings.generateRequestOnPageLoad = value;
	}
});
SomaRouterWire.NAME = "Wire::SomaStateWire";
