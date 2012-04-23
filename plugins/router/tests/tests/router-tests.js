describe("soma router plugin", function() {

	var app;
	var router;

	beforeEach(function () {
		app = new soma.Application();
	});

	afterEach(function () {
		if (router) {
			router.dispose();
			router = null;
		}
		app.dispose();
		app = null;
	});

	it("test create", function() {
		router = app.createPlugin(soma.router.Router);
		expect(router).not.toBeNull();
	});

	it("test type", function() {
		router = app.createPlugin(soma.router.Router);
		expect(router instanceof soma.router.Router).toBeTruthy();
	});

	it("test start", function() {
		var started = false;
		router = app.createPlugin(soma.router.Router, null, function() {
			started = true;
		});
		expect(started).toBeTruthy();
	});

	it("test member router", function() {
		router = app.createPlugin(soma.router.Router, routes);
		expect(router.router instanceof Davis.App).toBeTruthy();
	});

	it("test member routes", function() {
		router = app.createPlugin(soma.router.Router, routes);
		expect(router.routes).toEqual(routes);
	});

	it("test member handler", function() {
		var handler = function() {};
		router = app.createPlugin(soma.router.Router, null, handler);
		expect(router.handler).toEqual(handler);
	});

	it("test member somaRoutes", function() {
		var handler = function() {};
		var length = 0;
		for (var method in routes) {
			for (path in routes[method]) {
				length++;
			}
		}
		router = app.createPlugin(soma.router.Router, routes, handler);
		expect(router.somaRoutes).not.toBeNull();
		expect(router.somaRoutes.length).toEqual(length);
	});

	it("test route does not exist", function() {
		router = app.createPlugin(soma.router.Router, routes);
		var path = "/1/2/3/4/5/6";
		var route = router.router.lookupRoute("get", path);
		expect(route).toBeUndefined();
	});

	it("test route exist", function() {
		router = app.createPlugin(soma.router.Router, routes);
		var rule = ":rule1";
		var routeEvent = routes["get"][rule];
		var path = "dummy-route";
		var route = router.router.lookupRoute("get", path);
		expect(route).not.toBeUndefined();
		expect(findRouteWithRule(rule, router.somaRoutes)).toBeTruthy();
		expect(findRouteWithRouteEvent(routeEvent, router.somaRoutes)).toBeTruthy();
	});

	it("test command registered", function() {
		router = app.createPlugin(soma.router.Router);
		expect(app.hasCommand(soma.router.RouterEvent.CHANGED)).toBeTruthy();
	});

	it("test command executed", function() {
		var executed = false;
		function getExecuted() { return executed; };
		function setExecuted(event) { executed = true; };
		router = app.createPlugin(soma.router.Router, routes);
		app.addEventListener(soma.router.RouterEvent.CHANGED, setExecuted);
		waitsFor(getExecuted, "Time out!", 500);
		var current = Davis.location.current();
		changeUrl("dummy");
		runs(function() {
			expect(executed).toBeTruthy();
			app.removeEventListener(soma.router.RouterEvent.CHANGED, setExecuted);
			changeUrl(current);
		});
	});

	it("test prevent default", function() {
		var executed = false;
		var RouterCustomCommand = soma.Command.extend({
			execute: function(event) {
				switch(event.type) {
					case soma.router.RouterEvent.CHANGED:
						console.log("EXEC");
						executed = true;
						break;
				}
			}
		});
		function changeHandler(event) {
			event.preventDefault();
		};
		router = app.createPlugin(soma.router.Router, routes);
		app.removeCommand(soma.router.RouterEvent.CHANGED);
		app.addCommand(soma.router.RouterEvent.CHANGED, RouterCustomCommand);
		app.addEventListener(soma.router.RouterEvent.CHANGED, changeHandler);
		var current = Davis.location.current();
		changeUrl("dummy");
		expect(executed).not.toBeTruthy();
		changeUrl(current);
	});

	it("test dispose", function() {
		router = app.createPlugin(soma.router.Router, routes);
		router.dispose();
		expect(app.hasCommand(soma.router.RouterEvent.CHANGED)).not.toBeTruthy();
		expect(router.instance).toBeNull();
		expect(router.router).toBeNull();
		expect(router.routes).toBeNull();
		expect(router.handler).toBeNull();
		expect(router.somaRoutes).toBeNull();
	});

});
