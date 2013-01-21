describe("core", function () {

	var app;

	beforeEach(function () {
		app = new soma.Application();
	});

	afterEach(function () {
		app.dispose();
		app = null;
	});

	it("package soma", function () {
		expect(soma).toBeDefined();
	});

	it("package plugins", function () {
		expect(soma.plugins).toBeDefined();
	});

	it("component soma-events", function () {
		expect(soma.events).toBeDefined();
		expect(soma.Event).toBeDefined();
	});

	it("component infuse", function () {
		expect(infuse).toBeDefined();
	});

	it("create instance", function () {
		expect(app instanceof soma.Application).toBeTruthy();
	});

	it("instance injector", function () {
		expect(app.injector).toBeDefined();
		expect(app.injector instanceof infuse.Injector).toBeTruthy();
	});

	it("instance dispatcher", function () {
		expect(app.dispatcher).toBeDefined();
		expect(app.dispatcher instanceof soma.EventDispatcher).toBeTruthy();
	});

	it("instance mediators", function () {
		expect(app.mediators).toBeDefined();
	});

	it("instance commands", function () {
		expect(app.commands).toBeDefined();
	});

	it("extend application", function () {
		var SomaApplication = soma.Application.extend();
		var customApp = new SomaApplication();
		expect(typeof SomaApplication === 'function').toBeTruthy();
		expect(customApp instanceof SomaApplication).toBeTruthy();
		expect(customApp instanceof soma.Application).toBeTruthy();
	});

	it("extend application constructor called", function () {
		var count = 0;
		var SomaApplication = soma.Application.extend({
			constructor: function() {
				soma.Application.call(this);
				count++;
			}
		});
		var a = new SomaApplication();
		expect(count).toEqual(1);
		expect(a.dispatcher).toBeDefined();
	});

	it("extend application init called", function () {
		var count = 0;
		var SomaApplication = soma.Application.extend({
			init: function() {
				count++;
			}
		});
		var a = new SomaApplication();
		expect(count).toEqual(1);
		expect(a.dispatcher).toBeDefined();
	});

	it("extend application start called", function () {
		var count = 0;
		var SomaApplication = soma.Application.extend({
			start: function() {
				count++;
			}
		});
		var a = new SomaApplication();
		expect(count).toEqual(1);
		expect(a.dispatcher).toBeDefined();
	});

	it("dispose", function () {
		app.dispose();
		expect(app.instance).toBeUndefined();
		expect(app.commands).toBeUndefined();
		expect(app.injector).toBeUndefined();
		expect(app.mediators).toBeUndefined();
		expect(app.dispatcher).toBeUndefined();
	});

//	it("shortcuts dispatcher in instance", function () {
//		expect(typeof app.dispatch).toEqual('function');
//		expect(typeof app.dispatchEvent).toEqual('function');
//		expect(typeof app.addEventListener).toEqual('function');
//		expect(typeof app.removeEventListener).toEqual('function');
//		expect(typeof app.hasEventListener).toEqual('function');
//	});
//
//	it("shortcuts dispatcher in mediators", function () {
//		var f = function(){};
//		var m = app.mediators.create(f, 1);
//		expect(typeof m.dispatch).toEqual('function');
//		expect(typeof m.dispatchEvent).toEqual('function');
//		expect(typeof m.addEventListener).toEqual('function');
//		expect(typeof m.removeEventListener).toEqual('function');
//		expect(typeof m.hasEventListener).toEqual('function');
//	});
//
//	it("shortcuts dispatcher in commands", function () {
//		var executed = false;
//		var Command = function() {
//			this.execute = function(event) {
//				executed = true;
//				expect(typeof this.dispatch).toEqual('function');
//				expect(typeof this.dispatchEvent).toEqual('function');
//				expect(typeof this.addEventListener).toEqual('function');
//				expect(typeof this.removeEventListener).toEqual('function');
//				expect(typeof this.hasEventListener).toEqual('function');
//			}
//		}
//		app.commands.add('name', Command);
//		app.dispatch('name');
//		expect(executed).toBeTruthy();
//	});

});