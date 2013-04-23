describe("injection", function () {

	var app,
		injector;

	beforeEach(function () {
		app = new soma.Application();
		injector = app.injector;
	});

	afterEach(function () {
		app.dispose();
		app = null;
	});

	it("injection names", function () {
		expect(injector.hasMapping('instance')).toBeTruthy();
		expect(injector.hasMapping('commands')).toBeTruthy();
		expect(injector.hasMapping('injector')).toBeTruthy();
		expect(injector.hasMapping('mediators')).toBeTruthy();
		expect(injector.hasMapping('dispatcher')).toBeTruthy();
	});

	it("instance injection", function () {
		expect(injector.getValue('instance')).toEqual(app);
		var f = function(instance){this.instance = instance};
		var i = injector.createInstance(f);
		expect(i.instance).toBeDefined();
		expect(i.instance).toEqual(app);
	});

	it("instance injection in mediator", function () {
		var f = function(instance){this.instance = instance};
		var mediator = app.mediators.create(f, 1);
		expect(mediator.instance).toBeDefined();
		expect(mediator.instance).toEqual(app);
	});

	it("instance injection in command", function () {
		var injected;
		var f = function(instance) {
			this.execute = function(event) {
				injected = instance;
			}
		};
		app.commands.add('name', f);
		app.dispatcher.dispatch('name');
		expect(injected).toEqual(app);
	});

	it("commands injection", function () {
		expect(injector.getValue('commands')).toEqual(app.commands);
		var f = function(commands){this.commands = commands};
		var i = injector.createInstance(f);
		expect(i.commands).toBeDefined();
		expect(i.commands).toEqual(app.commands);
	});

	it("commands injection in mediator", function () {
		var f = function(commands){this.commands = commands};
		var mediator = app.mediators.create(f, 1);
		expect(mediator.commands).toBeDefined();
		expect(mediator.commands).toEqual(app.commands);
	});

	it("commands injection in command", function () {
		var injected;
		var f = function(commands) {
			this.execute = function(event) {
				injected = commands;
			}
		};
		app.commands.add('name', f);
		app.dispatcher.dispatch('name');
		expect(injected).toEqual(app.commands);
	});

	it("injector injection", function () {
		expect(injector.getValue('injector')).toEqual(app.injector);
		var f = function(injector){this.injector = injector};
		var i = injector.createInstance(f);
		expect(i.injector).toBeDefined();
		expect(i.injector).toEqual(app.injector);
	});

	it("injector injection in mediator", function () {
		var f = function(injector){this.injector = injector};
		var mediator = app.mediators.create(f, 1);
		expect(mediator.injector).toBeDefined();
		expect(mediator.injector).toEqual(app.injector);
	});

	it("injector injection in command", function () {
		var injected;
		var f = function(injector) {
			this.execute = function(event) {
				injected = injector;
			}
		};
		app.commands.add('name', f);
		app.dispatcher.dispatch('name');
		expect(injected).toEqual(app.injector);
	});

	it("mediators injection", function () {
		expect(injector.getValue('mediators')).toEqual(app.mediators);
		var f = function(mediators){this.mediators = mediators};
		var i = injector.createInstance(f);
		expect(i.mediators).toBeDefined();
		expect(i.mediators).toEqual(app.mediators);
	});

	it("mediators injection in mediator", function () {
		var f = function(mediators){this.mediators = mediators};
		var mediator = app.mediators.create(f, 1);
		expect(mediator.mediators).toBeDefined();
		expect(mediator.mediators).toEqual(app.mediators);
	});

	it("mediators injection in command", function () {
		var injected;
		var f = function(mediators) {
			this.execute = function(event) {
				injected = mediators;
			}
		};
		app.commands.add('name', f);
		app.dispatcher.dispatch('name');
		expect(injected).toEqual(app.mediators);
	});

	it("dispatcher injection", function () {
		expect(injector.getValue('dispatcher')).toEqual(app.dispatcher);
		var f = function(dispatcher){this.dispatcher = dispatcher};
		var i = injector.createInstance(f);
		expect(i.dispatcher).toBeDefined();
		expect(i.dispatcher).toEqual(app.dispatcher);
	});

	it("dispatcher injection in mediator", function () {
		var f = function(dispatcher){this.dispatcher = dispatcher};
		var mediator = app.mediators.create(f, 1);
		expect(mediator.dispatcher).toBeDefined();
		expect(mediator.dispatcher).toEqual(app.dispatcher);
	});

	it("dispatcher injection in command", function () {
		var injected;
		var f = function(dispatcher) {
			this.execute = function(event) {
				injected = dispatcher;
			}
		};
		app.commands.add('name', f);
		app.dispatcher.dispatch('name');
		expect(injected).toEqual(app.dispatcher);
	});

});