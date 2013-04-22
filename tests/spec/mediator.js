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

});