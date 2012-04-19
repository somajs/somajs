var SomaRouter = soma.extend({

	instance: null,
	router: null,
	routes: null,
	handler: null,
	somaRoutes: null,

	constructor: function(instance, routes, handler) {
		console.log("Plugin created", instance);
		this.instance = instance;
		this.routes = routes;
		this.handler = handler;
		this.router = Davis(handler);
		this.createRoutes();
		this.createElements();
		this.router.start();
	},

	createElements: function() {
		this.instance.addCommand(SomaRouterEvent.CHANGED, SomaRouterCommand);
	},

	removeElements: function() {
		this.instance.removeCommand(SomaRouterEvent.CHANGED, SomaRouterCommand);
	},

	createRoutes: function() {
		console.log("Create routes");
		this.somaRoutes = [];
		for (var method in this.routes) {
			if (this.router.hasOwnProperty(method) && typeof this.router[method] === "function") {
				for (var route in this.routes[method]) {
					console.log(route, this.routes[method][route]);
					var somaRoute = new SomaRoute(this.instance, route, this.routes[method][route]);
					this.router[method](route, somaRoute.handler.bind(somaRoute));
					this.somaRoutes.push(somaRoute);
				}
			}
		}
	},

	disposeSomaRoutes: function() {
		for (var i=0; i<this.somaRoutes.length; ++i) {
			this.somaRoutes[i].dispose();
		}
	},

	dispose: function() {
		this.disposeSomaRoutes();
		this.removeElements();
		this.instance = null;
		this.router = null;
		this.routes = null;
		this.handler = null;
		this.somaRoutes = null;
	}

});

var SomaRoute = soma.extend({

	instance: null,
	rule: null,
	routeEvent: null,

	constructor: function(instance, rule, routeEvent) {
		this.instance = instance;
		this.rule = rule;
		this.routeEvent = routeEvent;
	},

	handler: function(req) {
		this.instance.dispatchEvent(new SomaRouterEvent(SomaRouterEvent.CHANGED, this.routeEvent, this.rule, req));
	},

	dispose: function() {
		this.instance = null;
	}

});

var SomaRouterEvent = soma.Event.extend({

	constructor: function(type, routeEvent, rule, request) {
		return soma.Event.call(this, type, {routeEvent:routeEvent, rule:rule, request:request}, true, true);
	}

});
SomaRouterEvent.CHANGED = "SomaRouterEvent.CHANGED";

var SomaRouterCommand = soma.Command.extend({

	execute: function(event) {
		switch(event.type) {
			case SomaRouterEvent.CHANGED:
				console.log("dispatch update", event.params.routeEvent)
				this.dispatchEvent(new SomaRouterEvent(event.params.routeEvent, event.params.routeEvent, event.params.rule, event.params.request, true, true));
				break;
		}
	}

});
