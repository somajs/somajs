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
		var mediators = app.mediators.create(f, [{}]);
		expect(mediators[0].instance).toBeDefined();
		expect(mediators[0].instance).toEqual(app);
	});

	it("instance injection in command", function () {
		
	});

});