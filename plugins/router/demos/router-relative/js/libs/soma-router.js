soma.router = soma.router || {};

soma.router.Router = soma.extend({

	instance: null,
	router: null,
	routes: null,
	handler: null,
	somaRoutes: null,

	constructor: function(instance, routes, handler) {
		this.instance = instance;
		this.routes = routes;
		this.handler = handler;
		this.router = Davis(handler);
		this.createRoutes();
		this.createElements();
		this.router.start();
	},

	createElements: function() {
		this.instance.addCommand(soma.router.RouterEvent.CHANGED, soma.router.RouterCommand);
	},

	removeElements: function() {
		this.instance.removeCommand(soma.router.RouterEvent.CHANGED, soma.router.RouterCommand);
	},

	createRoutes: function() {
		this.somaRoutes = [];
		for (var method in this.routes) {
			if (this.router.hasOwnProperty(method) && typeof this.router[method] === "function") {
				for (var route in this.routes[method]) {
					var somaRoute = new soma.router.Route(this.instance, route, this.routes[method][route]);
					this.router[method](route, somaRoute.handler.bind(somaRoute));
					this.somaRoutes.push(somaRoute);
				}
			}
		}
	},

	disposeRoutes: function() {
		for (var i=0; i<this.somaRoutes.length; ++i) {
			this.somaRoutes[i].dispose();
		}
	},

	dispose: function() {
		this.disposeRoutes();
		this.removeElements();
		this.instance = null;
		this.router = null;
		this.routes = null;
		this.handler = null;
		this.somaRoutes = null;
	}

});

soma.router.Route = soma.extend({

	instance: null,
	rule: null,
	routeEvent: null,

	constructor: function(instance, rule, routeEvent) {
		this.instance = instance;
		this.rule = rule;
		this.routeEvent = routeEvent;
	},

	handler: function(req) {
		this.instance.dispatchEvent(new soma.router.RouterEvent(soma.router.RouterEvent.CHANGED, this.routeEvent, this.rule, req));
	},

	dispose: function() {
		this.instance = null;
	}

});

soma.router.RouterEvent = soma.Event.extend({

	constructor: function(type, routeEvent, rule, request) {
		return soma.Event.call(this, type, {routeEvent:routeEvent, rule:rule, request:request}, true, true);
	}

});
soma.router.RouterEvent.CHANGED = "SomaRouterEvent.CHANGED";

soma.router.RouterCommand = soma.Command.extend({

	execute: function(event) {
		switch(event.type) {
			case soma.router.RouterEvent.CHANGED:
				this.dispatchEvent(new soma.router.RouterEvent(event.params.routeEvent, event.params.routeEvent, event.params.rule, event.params.request, true, true));
				break;
		}
	}

});
