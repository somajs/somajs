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

	it("multiple mediator target", function () {
		var t = [];
		var f = function(target){t.push(target);};
		var m = mediators.create(f, [1, 2]);
		expect(m[0] instanceof f).toBeTruthy();
		expect(m[1] instanceof f).toBeTruthy();
		expect(t[0]).toEqual(1);
		expect(t[1]).toEqual(2);
	});

	it("mediator get injection from parent", function () {
		app.injector.mapValue('parentData', 'someData');
		var d;
		var f = function(target, parentData){d=parentData;};
		var m = mediators.create(f, 1);
		expect(m instanceof f).toBeTruthy();
		expect(d).toEqual('someData');
	});

	it("single mediator data", function () {
		var t, d;
		var dataSource = {info:'data'};
		var f = function(target, data){t=target;d=data};
		var m = mediators.create(f, 1, dataSource);
		expect(m instanceof f).toBeTruthy();
		expect(t).toEqual(1);
		expect(d).toBeDefined();
		expect(d).toEqual(dataSource);
	});

	it("single mediator boolean", function () {
		var d;
		var f = function(target, data){d=data;};
		var m = mediators.create(f, 1, false);
		expect(d).toBeFalsy();
	});

	it("single mediator data undefined", function () {
		var d;
		var f = function(target, data){d=data};
		var m = mediators.create(f, 1, undefined);
		expect(d).toBeUndefined();
	});

	it("single mediator data null", function () {
		var d;
		var f = function(target, data){d=data;};
		var m = mediators.create(f, 1, null);
		expect(d).toBeUndefined();
	});

	it("multiple mediator data", function () {
		var t = [], d = [];
		var dataSource = {info:'data'};
		var f = function(target, data){t.push(target);d.push(data);};
		var m = mediators.create(f, [1, 2], dataSource);
		expect(m[0] instanceof f).toBeTruthy();
		expect(m[1] instanceof f).toBeTruthy();
		expect(t[0]).toEqual(1);
		expect(t[1]).toEqual(2);
		expect(d[0]).toBeDefined();
		expect(d[0]).toEqual(dataSource);
		expect(d[1]).toBeDefined();
		expect(d[1]).toEqual(dataSource);
	});

	it("single mediator precall child injector mapping", function () {
		var d, d1, d2;
		var f = function(target, data, data1, data2){d=data;d1=data1;d2=data2;};
		var m = mediators.create(f, 1, function(childInjector, index) {
			expect(childInjector instanceof infuse.Injector).toBeTruthy();
			expect(childInjector.parent).toEqual(app.injector);
			expect(index).toEqual(0);
			childInjector.mapValue('data1', 'some data');
			childInjector.mapValue('data2', 'other data');
		});
		expect(d).toBeUndefined();
		expect(d1).toEqual('some data');
		expect(d2).toEqual('other data');
	});

	it("multiple mediator precall child injector mapping", function () {
		var sourceData = ['data1', 'data2'];
		var count = 0;
		var d = [];
		var f = function(target, dataTest){d.push(dataTest);};
		var m = mediators.create(f, [1, 2], function(childInjector, index) {
			expect(childInjector instanceof infuse.Injector).toBeTruthy();
			expect(childInjector.parent).toEqual(app.injector);
			expect(index).toEqual(count++);
			childInjector.mapValue('dataTest', sourceData[index]);
		});
		expect(d[0]).toEqual('data1');
		expect(d[1]).toEqual('data2');
	});

	it("single mediator precall return value", function () {
		var d;
		var f = function(target, data){d=data;};
		var m = mediators.create(f, 1, function(childInjector, index) {
			expect(childInjector instanceof infuse.Injector).toBeTruthy();
			expect(childInjector.parent).toEqual(app.injector);
			expect(index).toEqual(0);
			return 'some data';
		});
		expect(d).toEqual('some data');
	});

	it("multiple mediator precall return value", function () {
		var sourceData = ['data1', 'data2'];
		var count = 0;
		var d = [];
		var f = function(target, data){d.push(data);};
		var m = mediators.create(f, [1, 2], function(childInjector, index) {
			expect(childInjector instanceof infuse.Injector).toBeTruthy();
			expect(childInjector.parent).toEqual(app.injector);
			expect(index).toEqual(count++);
			return sourceData[index];
		});
		expect(d[0]).toEqual('data1');
		expect(d[1]).toEqual('data2');
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