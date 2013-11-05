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
		var f = function(target, info){t=target;d=info};
		var m = mediators.create(f, 1, dataSource);
		expect(m instanceof f).toBeTruthy();
		expect(t).toEqual(1);
		expect(d).toBeDefined();
		expect(d).toEqual(dataSource.info);
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
		var f = function(target, info){t.push(target);d.push(info);};
		var m = mediators.create(f, [1, 2], dataSource);
		expect(m[0] instanceof f).toBeTruthy();
		expect(m[1] instanceof f).toBeTruthy();
		expect(t[0]).toEqual(1);
		expect(t[1]).toEqual(2);
		expect(d[0]).toBeDefined();
		expect(d[0]).toEqual(dataSource.info);
		expect(d[1]).toBeDefined();
		expect(d[1]).toEqual(dataSource.info);
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
			return {data:'some data'};
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
			return {data: sourceData[index]};
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

	if (typeof MutationObserver !== 'undefined') {
		it("is observing", function () {
			mediators.observe(document);
			expect(mediators.isObserving).toBeTruthy();
			expect(mediators.observer instanceof MutationObserver).toBeTruthy();
		});
	}

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
		expect(mediators.getMapping('Mediator').mediator).toEqual(Mediator);
	});

	it("unmap mediator", function () {
		var Mediator = function() {};
		mediators.observe(document);
		mediators.map('Mediator', Mediator);
		mediators.unmap('Mediator');
		expect(mediators.hasMapping('Mediator')).toBeFalsy();
		expect(mediators.getMapping('Mediator')).toBeUndefined();
	});

	it("add/get/has a mediator manual", function () {
		var div = document.createElement('div');
		var Mediator = function(){};
		var mediator = mediators.create(Mediator, div);
		mediators.add(div, mediator);
		expect(mediators.has(div)).toBeTruthy();
		expect(mediators.get(div) instanceof Mediator).toBeTruthy();
	});

	it("remove a mediator manual", function () {
		var div = document.createElement('div');
		var Mediator = function(){};
		var mediator = mediators.create(Mediator, div);
		mediators.add(div, mediator);
		mediators.remove(div);
		expect(mediators.has(div)).toBeFalsy();
		expect(mediators.get(div)).toBeUndefined();
	});

	it("observer has a mediator", function () {
		var isCreated = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			isCreated = true;
			expect(div.firstChild).toEqual(target);
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(mediators.has(div.firstChild)).toBeTruthy();
		});
	});

	it("observer get a mediator", function () {
		var isCreated = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			this.target = target;
			isCreated = true;
			expect(div.firstChild).toEqual(target);
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(mediators.get(div.firstChild) instanceof Mediator).toBeTruthy();
			expect(mediators.get(div.firstChild).target).toEqual(div.firstChild);
		});
	});

	it("observer creates a mediator", function () {
		var isCreated = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			isCreated = true;
			expect(div.firstChild).toEqual(target);
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(isCreated).toBeTruthy();
		});
	});

	it("observer creates 2 mediators", function () {
		var count = 0;
		var check = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			count++;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"><p data-mediator="Mediator"></p></div>';
			mediators.support(div);
			setTimeout(function() {
				check = true;
			}, 100);
		});
		waitsFor(function() {
			return count === 2;
		}, "2 mediators should be created", 5000);
		runs(function() {
			expect(count === 2).toBeTruthy();
		});
	});

	it("observer removes a mediator", function () {
		var isCreated = false;
		var isRemoved = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			isCreated = true;
			expect(div.firstChild).toEqual(target);
			this.dispose = function() {
				isRemoved = true;
			};
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			console.log('is created', isCreated);
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(isCreated).toBeTruthy();
			div.innerHTML = '';
			mediators.support(div);
		});
		waitsFor(function() {
			console.log('is removed', isCreated);
			return isRemoved;
		}, "The mediator should be removed", 5000);
		runs(function() {
			expect(isRemoved).toBeTruthy();
		});
	});

	it("observer removes 2 mediators", function () {
		var countCreated = 0;
		var countRemoved = 0;
		var div = document.createElement('div');
		var Mediator = function(target) {
			countCreated++;
			this.dispose = function() {
				countRemoved++;
			};
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"><p data-mediator="Mediator"></p></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return countCreated === 2;
		}, "2 mediators should be created", 5000);
		runs(function() {
			div.innerHTML = '';
			mediators.support(div);
			expect(countCreated === 2).toBeTruthy();
		});
		waitsFor(function() {
			return countRemoved === 2;
		}, "2 mediators should be removed", 5000);
		runs(function() {
			expect(countRemoved).toBeTruthy();
		});
	});

	it("parse already created mediator", function () {
		var count = 0;
		var Mediator = function() {
			count++;
		};
		var div = document.createElement('div');
		var str = '';
		str += '<div class="level1" data-mediator="Mediator">';
		str += '    <span class="level2" data-mediator="Mediator">';
		str += '       <p class="level3" data-mediator="Mediator">Hello</p>';
		str += '    </span>';
		str += '</div>';
		div.innerHTML = str;
		runs(function() {
			mediators.map('Mediator', Mediator);
			mediators.observe(div);
		});
		waitsFor(function() {
			return count === 3;
		}, "Three mediators should have been created", 5000);
		runs(function() {
			expect(count).toEqual(3);
		});
	});

	it("parse manually already created mediator", function () {
		var count = 0;
		var check = false;
		var Mediator = function() {
			count++;
		};
		var div = document.createElement('div');
		var str = '';
		str += '<div class="level1" data-mediator="Mediator">';
		str += '    <span class="level2" data-mediator="Mediator">';
		str += '       <p class="level3" data-mediator="Mediator">Hello</p>';
		str += '    </span>';
		str += '</div>';
		div.innerHTML = str;
		runs(function() {
			mediators.map('Mediator', Mediator);
			mediators.observe(div, false);
			setTimeout(function() {
				check = true;
			}, 100);
		});
		waitsFor(function() {
			return check;
		}, "The mediator should be removed", 5000);
		runs(function() {
			expect(count).toEqual(0);
		});
	});

	it("parse manually", function () {
		var count = 0;
		var Mediator = function() {
			count++;
		};
		var div = document.createElement('div');
		var str = '';
		str += '<div class="level1" data-mediator="Mediator">';
		str += '    <span class="level2" data-mediator="Mediator">';
		str += '       <p class="level3" data-mediator="Mediator">Hello</p>';
		str += '    </span>';
		str += '</div>';
		div.innerHTML = str;
		runs(function() {
			mediators.map('Mediator', Mediator);
			mediators.observe(div, false);
			mediators.parse(div);
		});
		waitsFor(function() {
			return count === 3;
		}, "Three mediators should have been created", 5000);
		runs(function() {
			expect(count).toEqual(3);
		});
	});

	it("parse to remove", function () {
		var count = 0;
		var countRemove = 0;
		var Mediator = function() {
			count++;
			this.dispose = function() {
				countRemove++;
			};
		};
		var div = document.createElement('div');
		var str = '';
		str += '<div class="level1" data-mediator="Mediator">';
		str += '    <span class="level2" data-mediator="Mediator">';
		str += '       <p class="level3" data-mediator="Mediator">Hello</p>';
		str += '    </span>';
		str += '</div>';
		div.innerHTML = str;
		runs(function() {
			mediators.map('Mediator', Mediator);
			mediators.observe(div, false);
			mediators.parse(div);
		});
		waitsFor(function() {
			return count === 3;
		}, "Three mediators should have been created", 5000);
		runs(function() {
			mediators.parseToRemove(div);
		});
		waitsFor(function() {
			return countRemove === 3;
		}, "Three mediators should have been removed", 5000);
		runs(function() {
			expect(countRemove).toEqual(3);
		});
	});

	it("observer does not create twice the same mediator", function () {
		var count = false;
		var check = false;
		var div = document.createElement('div');
		var Mediator = function(target) {
			count++;
			expect(div.firstChild).toEqual(target);
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.parse(div);
			setTimeout(function() {
				check = true;
			}, 100);
		});
		waitsFor(function() {
			return check;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(count).toEqual(1);
		});
	});

	it("observer watch subtree", function () {
		var isCreated = false;
		var div = document.createElement('div');
		div.innerHTML = '<div/>';
		var divChild = div.firstChild;
		var Mediator = function(target) {
			isCreated = true;
			expect(divChild.firstChild).toEqual(target);
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator);
			divChild.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(mediators.has(divChild.firstChild)).toBeTruthy();
		});
	});

	it("observer data", function () {
		var dataSource = [1, 2, 3];
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toEqual(dataSource);
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:dataSource});
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data string", function () {
		var dataSource = 'data';
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toEqual(dataSource);
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:dataSource});
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data mapped value", function () {
		var dataSource = [1, 2, 3];
		app.injector.mapValue('mapped', dataSource);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toEqual(dataSource);
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data: 'mapped'});
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data mapped class singleton", function () {
		var d = [];
		var t = [];
		var Model = function(){this.name='model name'};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data instanceof Model).toBeTruthy();
			expect(data.name).toEqual('model name');
			t.push(target);
			d.push(data);
			if (d.length === 2) {
				done = true;
			}
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator"></div><div data-mediator="Mediator"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(t[0]).toEqual(div.childNodes[0]);
			expect(t[1]).toEqual(div.childNodes[1]);
			expect(d.length).toEqual(2);
			expect(d[0]).toEqual(d[1])
		});
	});

	it("observer data boolean", function () {
		var dataSource = false;
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toBeFalsy();
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, dataSource);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data undefined", function () {
		var dataSource = undefined;
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toBeUndefined();
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, dataSource);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data null", function () {
		var dataSource = undefined;
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(div.firstChild).toEqual(target);
			expect(data).toBeUndefined();
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, dataSource);
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer precall return value", function () {
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('some data');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, function(childInjector, index) {
				expect(childInjector instanceof infuse.Injector).toBeTruthy();
				expect(childInjector.parent).toEqual(app.injector);
				expect(index).toEqual(0);
				return {data: 'some data'};
			});
			div.innerHTML = '<div data-mediator="Mediator"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path separator no path", function () {
		var dataSource = {info:'info'};
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, info) {
			expect(info).toEqual('info');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, dataSource);
			div.innerHTML = '<div data-mediator="Mediator|"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path separator wrong path", function () {
		var dataSource = {info:'info'};
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, info) {
			expect(info).toEqual('info');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, dataSource);
			div.innerHTML = '<div data-mediator="Mediator|wrong"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path object", function () {
		var dataSource = {info:'info'};
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			console.log('data', data);
			expect(data).toEqual('info');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data: dataSource});
			div.innerHTML = '<div data-mediator="Mediator|data:info"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path array", function () {
		var dataSource = ['data1', 'data2'];
		var d = [];
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			d.push(data);
			if (d.length === 3) {
				done = true;
			}
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data: dataSource});
			div.innerHTML = '<div data-mediator="Mediator|data:0"></div><div data-mediator="Mediator|data:1"></div><div data-mediator="Mediator|data:2"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(d[0]).toEqual(dataSource[0]);
			expect(d[1]).toEqual(dataSource[1]);
			expect(d[2]).toEqual(dataSource[2]); // undefined
		});
	});

	it("observer data path function", function () {
		var Model = function() {
			this.get = function(){
				return 'some data';
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('some data');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get()"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path function and object", function () {
		var Model = function() {
			this.get = function(){
				return {info:'info'};
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('info');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get().info"/>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path function and array", function () {
		var Model = function() {
			this.get = function(){
				return ['data1', 'data2'];
			};
		};
		app.injector.mapClass('model', Model, true);
		var d = [];
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			d.push(data);
			if (d.length === 2) {
				done = true;
			}
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get().0"></div><div data-mediator="Mediator|data:get().1"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(d.length).toEqual(2);
			expect(d[0]).toEqual('data1');
			expect(d[1]).toEqual('data2');
		});
	});

	it("observer data path function with single param", function () {
		var Model = function() {
			var data = ['data1', 'data2'];
			this.get = function(id){
				expect(id).toEqual('0');
				return data[id];
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('data1');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get(0)"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path function with multiple params", function () {
		var Model = function() {
			var data = [{title:'data1', label:'data2'}];
			this.get = function(id, path){
				console.log('ID', id);
				console.log('PATH', path);
				expect(id).toEqual('0');
				expect(path).toEqual('title');
				return data[id][path];
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('data1');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get(0,title)"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path function with multiple string params single quotes", function () {
		var Model = function() {
			var data = [{title:'data1', label:'data2'}];
			this.get = function(id, path){
				console.log('ID', id);
				console.log('PATH', path);
				expect(id).toEqual('0');
				expect(path).toEqual('title');
				return data[id][path];
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('data1');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get(\'0\',\'title\')"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path function with multiple string params double quotes", function () {
		var Model = function() {
			var data = [{title:'data1', label:'data2'}];
			this.get = function(id, path){
				expect(id).toEqual('0');
				expect(path).toEqual('title');
				return data[id][path];
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('data1');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = "<div data-mediator='Mediator|data:get(\"0\",\"title\")'></div>";
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

	it("observer data path complex", function () {
		var Model = function() {
			var data = {
				path: [
					{
						func: function(id, name) {
							expect(id).toEqual('1');
							expect(name).toEqual('list');
							var d = {
								list: ['list1', 'list2']
							};
							return d[name][id];
						}

					}
				]
			};
			this.get = function(path){
				expect(path).toEqual('path');
				return data[path];
			};
		};
		app.injector.mapClass('model', Model, true);
		var done = false;
		var div = document.createElement('div');
		var Mediator = function(target, data) {
			expect(data).toEqual('list2');
			done = true;
		};
		runs(function() {
			mediators.observe(div);
			mediators.map('Mediator', Mediator, {data:'model'});
			div.innerHTML = '<div data-mediator="Mediator|data:get(path).0.func(1,list)"></div>';
			mediators.support(div);
		});
		waitsFor(function() {
			return done;
		}, "The mediator should be created", 5000);
	});

});
