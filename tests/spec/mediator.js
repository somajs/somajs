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
		console.log('ABC');
		console.log(typeof MutationObserver);
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
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(mediators.has(div)).toBeTruthy();
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
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			expect(mediators.get(div) instanceof Mediator).toBeTruthy();
			expect(mediators.get(div).target).toEqual(div.firstChild);
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
		});
		waitsFor(function() {
			return isCreated;
		}, "The mediator should be created", 5000);
		runs(function() {
			div.innerHTML = '';
			expect(isCreated).toBeTruthy();
		});
		waitsFor(function() {
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
		});
		waitsFor(function() {
			return countCreated === 2;
		}, "2 mediators should be created", 5000);
		runs(function() {
			div.innerHTML = '';
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

});