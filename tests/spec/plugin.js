describe("mediators", function () {

	var app;

	beforeEach(function () {
		app = new soma.Application();
	});

	afterEach(function () {
		app.dispose();
		app = null;
	});

	it("create plugin", function () {
		var Plugin = function(){};
		var p = app.createPlugin(Plugin);
		expect(p instanceof Plugin).toBeTruthy();
	});

	it("injections and parameters", function () {
		app.injector.mapValue('prop', 'propValue');
		var Plugin = function(injector, commands, mediators, dispatcher, injector, prop, p1, p2, p3, p4, p5, p6, p7) {
			expect(injector).toEqual(app.injector);
			expect(commands).toEqual(app.commands);
			expect(mediators).toEqual(app.mediators);
			expect(dispatcher).toEqual(app.dispatcher);
			expect(prop).toEqual('propValue');
			expect(p1).toEqual('param1');
			expect(p2).toEqual(1);
			expect(p3).toEqual(false);
			expect(p4).toEqual([1, 2, 3]);
			expect(p5).toEqual({name:'john'});
			expect(p6).toEqual('');
			expect(p7).toBeUndefined();
		};
		var p = app.createPlugin(Plugin, 'param1', 1, false, [1, 2, 3], {name:'john'}, '');
		expect(p instanceof Plugin).toBeTruthy();
	});

	it("auto-create add", function () {
		var Plugin = function(instance){
			instance.constructor.prototype.createSomething = function(){};
		};
		soma.plugins.add(Plugin);
		var application = new soma.Application();
		expect(typeof application.createSomething).toEqual('function');
		// cleaning
		application.constructor.prototype.createSomething = undefined;
		soma.plugins.remove(Plugin);
	});

	it("auto-create remove", function () {
		var Plugin = function(instance){
			instance.constructor.prototype.createSomething = function(){};
		};
		soma.plugins.add(Plugin);
		soma.plugins.remove(Plugin);
		var application = new soma.Application();
		expect(application.createSomething).toBeUndefined();
		// cleaning
		application.constructor.prototype.createSomething = undefined;
		soma.plugins.remove(Plugin);
	});

});