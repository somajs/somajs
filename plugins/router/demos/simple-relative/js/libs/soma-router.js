var SomaRouter = soma.extend({
	instance: null,
	wire:null,
	app: null,
	constructor: function(instance, routes) {
		this.instance = instance;
		this.wire = this.instance.addWire(SomaRouterWire.NAME, new SomaRouterWire());
		this.wire.create();
		this.app = this.wire.app;
		if (routes) this.wire.setConfig(routes);
	},
	setConfig: function(routes) {
		this.wire.setConfig(routes);
	},
	enableHashRouting: function(options) {
		Davis.extend(Davis.hashRouting(options))
	},
	dispose: function() {
		this.instance.removeWire(SomaRouterWire.NAME);
		app = null
		wire = null;
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
	getCurrent: function() {
		return this.wire.getCurrent();
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

var SomaRouterCommand = soma.Command.extend({
	execute: function(event) {
		var wire = this.getWire(SomaRouterWire.NAME);
		switch(event.type) {
			case SomaRouterEvent.START:
				wire.start();
				break;
			case SomaRouterEvent.STOP:
				wire.stop();
				break;
			case SomaRouterEvent.CHANGED:
				this.dispatchEvent(new SomaRouterEvent(event.params.type, event.params, true, true));
				break;
		}
	}
});

var SomaRouteWire = soma.Wire.extend({
	path:null,
	type:null,
	routeHandler: function(req) {
		var params = {
			request:req,
			path:this.path,
			type: this.name
		};
		for (var s in req.params) {
			params[s] = req.params[s];
		}
		this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.CHANGED, params, true, true));
	}
});

var SomaRouterEvent = soma.Event.extend();
//
SomaRouterEvent.CHANGED = "SomaRouterEvent.CHANGED";
SomaRouterEvent.START = "SomaRouterEvent.START";
SomaRouterEvent.STOP = "SomaRouterEvent.STOP";

SomaRouterEvent.STARTED = "SomaRouterEvent.STARTED";
SomaRouterEvent.LOOKUP_ROUTE = "SomaRouterEvent.LOOKUP_ROUTE";
SomaRouterEvent.RUN_ROUTE = "SomaRouterEvent.RUN_ROUTE";
SomaRouterEvent.ROUTE_NOT_FOUND = "SomaRouterEvent.ROUTE_NOT_FOUND";
SomaRouterEvent.REQUEST_HALTED = "SomaRouterEvent.REQUEST_HALTED";
SomaRouterEvent.UNSUPPORTED = "SomaRouterEvent.UNSUPPORTED";

var SomaRouterWire = soma.Wire.extend({
	app: null,
	config: null,
	init: function() {
		this.addCommand(SomaRouterEvent.CHANGED, SomaRouterCommand);
		this.addCommand(SomaRouterEvent.START, SomaRouterCommand);
		this.addCommand(SomaRouterEvent.STOP, SomaRouterCommand);
	},
	dispose: function() {
		this.removeCommand(SomaRouterEvent.CHANGED);
		this.removeCommand(SomaRouterEvent.START);
		this.removeCommand(SomaRouterEvent.STOP);
		this.disposeConfig();
		this.app.stop();
		this.app = null;
	},
	disposeConfig: function() {
		for (var path in this.config) {
			this.removeWire(this.config[path]);
		}
	},
	create: function() {
		this.app = Davis();
		this.bindEvents();
	},
	bindEvents: function() {
		this.app.bind("start", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.STARTED, req)); }.bind(this));
		this.app.bind("lookupRoute", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.LOOKUP_ROUTE, req)); }.bind(this));
		this.app.bind("runRoute", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.RUN_ROUTE, req)); }.bind(this));
		this.app.bind("routeNotFound", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.ROUTE_NOT_FOUND, req)); }.bind(this));
		this.app.bind("requestHalted", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.REQUEST_HALTED, req)); }.bind(this));
		this.app.bind("unsupported", function(req){ this.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.UNSUPPORTED, req)); }.bind(this));
	},
	start: function() {
		console.log('START');
		this.app.start();
	},
	stop: function() {
		console.log('STOP');
		this.app.stop();
	},
	setConfig: function(routes) {
		this.disposeConfig();
		this.config = routes;
		for (var path in routes) {
			var routeWire = this.addWire(routes[path], new SomaRouteWire(routes[path]));
			routeWire.path = path;

			console.log("add route:", path)

			this.app.get(path, routeWire.routeHandler.bind(routeWire));

		}
	},
	getCurrent: function() {
		return Davis.location.current();
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
SomaRouterWire.NAME = "Wire::SomaRouterWire";

