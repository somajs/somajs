describe("mediators", function () {

	beforeEach(function () {

	});

	afterEach(function () {

	});

	it("apply properties", function () {
		var a = {};
		var b = {p1:1, p2:function(){}};
		soma.applyProperties(a, b);
		expect(a).toEqual(b);
		expect(a.p1).toEqual(b.p1);
		expect(a.p2).toEqual(b.p2);
	});

	it("apply properties object to instance", function () {
		var A = function(){
			this.name = "john";
		};
		var b = {p1:function(){
			return this;
		}};
		var a = new A();
		soma.applyProperties(a, b);
		expect(a.p1()).toEqual(a);
		expect(a.p1().name).toEqual(a.name);
	});

	it("apply properties instance to instance", function () {
		var A = function(){
			this.name = "john";
		};
		var B = function() {
			this.age = 21;
		};
		B.prototype.getAge = function() {
			return this.age;
		}
		var a = new A();
		var b = new B();
		soma.applyProperties(a, b, false, ['getAge']);
		console.log(a.getAge(), a.name);
	});

});