describe("commands", function () {

	var app,
		commands,
		count,
		evt,
		params;

	var Command = function() {
		this.execute = function(event) {
			evt = event;
			params = event.params;
			count++;
		}
	}

	beforeEach(function () {
		app = new soma.Application();
		commands = app.commands;
	});

	afterEach(function () {
		count = 0;
		evt = undefined;
		params = undefined;
		app.dispose();
		app = null;
	});

	it("has command wrong name", function () {
		expect(function(){commands.add(undefined);}).toThrow();
		expect(function(){commands.add(null);}).toThrow();
		expect(function(){commands.add();}).toThrow();
		expect(function(){commands.add(1);}).toThrow();
		expect(function(){commands.add(true);}).toThrow();
	});

	it("has command wrong function", function () {
		expect(function(){commands.add('name', undefined);}).toThrow();
		expect(function(){commands.add('name', null);}).toThrow();
		expect(function(){commands.add('name');}).toThrow();
		expect(function(){commands.add('name', 1);}).toThrow();
		expect(function(){commands.add('name', true);}).toThrow();
	});

	it("has command", function () {
		commands.add('name', Command);
		expect(commands.has('name')).toBeTruthy();
		expect(commands.has('other')).toBeFalsy();
	});

	it("already has command", function () {
		commands.add('name', Command);
		expect(function(){commands.add('name', Command);}).toThrow();
	});

	it("get command", function () {
		commands.add('name', Command);
		expect(commands.get('name')).toEqual(Command);
		expect(commands.get('other')).toBeUndefined();
	});

	it("get all", function () {
		commands.add('name', Command);
		commands.add('other', Command);
		var count = 0;
		for (var c in commands.getAll()) {
			count++;
		}
		expect(count).toEqual(2);
		expect(commands.getAll()['name']).toEqual(Command);
		expect(commands.getAll()['other']).toEqual(Command);
	});

	it("remove", function () {
		commands.add('name', Command);
		expect(commands.has('name')).toBeTruthy();
		commands.remove('name', Command);
		expect(commands.has('name')).toBeFalsy();
		expect(commands.get('name')).toBeUndefined();
	});

	it("remove non existing", function () {
		expect(function(){commands.remove('other', Command);}).not.toThrow();
	});

	it("command execute", function () {
		commands.add('name', Command);
		app.dispatcher.dispatch('name');
		app.dispatcher.dispatchEvent(new soma.Event('name'));
		expect(count).toEqual(2);
		expect(evt.type).toEqual('name');
	});

	it("command listener", function () {
		var c = 0;
		commands.add('name', Command);
		app.dispatcher.addEventListener('name', function(event) {
			expect(event.type).toEqual('name');
			c++;
		});
		app.dispatcher.dispatch('name');
		app.dispatcher.dispatchEvent(new soma.Event('name'));
		expect(c).toEqual(2);
		expect(count).toEqual(2);
	});

	it("command execute prevent default", function () {
		var c = 0;
		commands.add('name', Command);
		app.dispatcher.addEventListener('name', function(event) {
			event.preventDefault();
			expect(event.type).toEqual('name');
			c++;
		});
		app.dispatcher.dispatch('name', undefined, true, true);
		app.dispatcher.dispatchEvent(new soma.Event('name', undefined, true, true));
		expect(c).toEqual(2);
		expect(count).toEqual(0);
	});

	it("command execute prevent default not cancelable", function () {
		var c = 0;
		commands.add('name', Command);
		app.dispatcher.addEventListener('name', function(event) {
			event.preventDefault();
			expect(event.type).toEqual('name');
			c++;
		});
		app.dispatcher.dispatch('name');
		app.dispatcher.dispatchEvent(new soma.Event('name'));
		expect(c).toEqual(2);
		expect(count).toEqual(2);
	});

	it("command listener priority", function () {
		var c = 0;
		var first = false;
		commands.add('name', Command);
		app.dispatcher.addEventListener('name', function(event) {
			expect(event.type).toEqual('name');
			expect(first).toBeTruthy();
			c++;
		}, 0);
		app.dispatcher.addEventListener('name', function(event) {
			expect(event.type).toEqual('name');
			first = true;
			c++;
		}, 1);
		app.dispatcher.dispatch('name');
		first = false;
		app.dispatcher.dispatchEvent(new soma.Event('name'));
		expect(c).toEqual(4);
		expect(count).toEqual(2);
	});

	it("dispose", function () {
		commands.add('name', Command);
		commands.dispose();
		expect(commands.boundHandler).toBeUndefined();
		expect(commands.dispatcher).toBeUndefined();
		expect(commands.injector).toBeUndefined();
		expect(commands.list).toBeUndefined();
	});

});