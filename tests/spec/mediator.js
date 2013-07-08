describe("mediators", function () {

	var app,
		mediators;

	beforeEach(function () {
		app = new soma.Application();
		mediators = app.mediators;
	});

	afterEach(function () {
		app.dispose();
		app = null;
	});

	it("create single mediator", function () {
		var t;
		var f = function(target){t = target;};
		var m = mediators.create(f, 1);
		expect(m instanceof f).toBeTruthy();
		expect(t).toEqual(1);
	});

	it("create mediator list", function () {
		var t;
		var f = function(target){t = target;};
		var m = mediators.create(f, [1, 2, 3]);
		expect(m.length).toEqual(3);
		expect(m[0] instanceof f).toBeTruthy();
		expect(m[1] instanceof f).toBeTruthy();
		expect(m[2] instanceof f).toBeTruthy();
		expect(t).toEqual(3);
	});

	it("mediator targets", function () {
		var t = [];
		var f = function(target){t.push(target);};
		var m = mediators.create(f, [1, 2]);
		expect(m[0] instanceof f).toBeTruthy();
		expect(m[1] instanceof f).toBeTruthy();
		expect(t[0]).toEqual(1);
		expect(t[1]).toEqual(2);
	});

	it("wrong first param", function () {
		expect(function(){mediators.create();}).toThrow();
		expect(function(){mediators.create('string');}).toThrow();
		expect(function(){mediators.create(1);}).toThrow();
		expect(function(){mediators.create(true);}).toThrow();
		expect(function(){mediators.create(null);}).toThrow();
		expect(function(){mediators.create(undefined);}).toThrow();
	});

	it("wrong second param", function () {
		var f = function(){};
		expect(function(){mediators.create(f);}).toThrow();
		expect(function(){mediators.create(f, null);}).toThrow();
		expect(function(){mediators.create(f, undefined);}).toThrow();
	});

	it("dispose", function () {
		mediators.dispose();
		expect(mediators.injector).toBeUndefined();
		expect(mediators.dispatcher).toBeUndefined();
	});

	it("is observing", function () {
		mediators.observe(document);
		expect(mediators.isObserving).toBeTruthy();
		expect(mediators.observer instanceof MutationObserver).toBeTruthy();
	});

	it("is not observing", function () {
		mediators.observe();
		expect(mediators.isObserving).toBeFalsy();
		expect(mediators.observer).toBeNull();
	});

	it("map mediator", function () {
		var Mediator = function() {};
		mediators.observe(document);
		mediators.map('Mediator', Mediator);
		expect(mediators.hasMapping('Mediator')).toBeTruthy();
	});

	it("get mapping", function () {
		var Mediator = function() {};
		mediators.observe(document);
		mediators.map('Mediator', Mediator);
		expect(mediators.getMapping('Mediator')).toEqual(Mediator);
	});

	it("unmap mediator", function () {
		var Mediator = function() {};
		mediators.observe(document);
		mediators.map('Mediator', Mediator);
		mediators.unmap('Mediator');
		expect(mediators.hasMapping('Mediator')).toBeFalsy();
		expect(mediators.getMapping('Mediator')).toBeUndefined();
	});

	it("observer creates a mediator", function () {
		var isCreated = false;
		runs(function() {
			var Mediator = function(target) {
				console.log('CREATED');
				isCreated = true;
			};
			var div = document.createElement('div');
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(isCreated).toBeTruthy();
		});
	});

});