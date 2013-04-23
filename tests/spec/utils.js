describe("utils", function () {

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

	it("apply properties instance to instance (no binding)", function () {
		var A = function(){
			this.name = "john";
			this.age = 32;
		};
		var B = function() {
			this.name = "david";
			this.age = 21;
		};
		B.prototype.getName = function() {
			return this.name;
		}
		B.prototype.getAge = function() {
			return this.age;
		}
		var a = new A();
		var b = new B();
		soma.applyProperties(a, b, false, ['getAge']);
		expect(a.name).toEqual('john');
		expect(a.age).toEqual(32);
		expect(a.getAge()).toEqual(32);
		expect(function(){a.getName();}).toThrow();
	});

	it("apply properties instance to instance (with binding)", function () {
		var A = function(){
			this.name = "john";
			this.age = 32;
		};
		var B = function() {
			this.name = "david";
			this.age = 21;
		};
		B.prototype.getName = function() {
			return this.name;
		}
		B.prototype.getAge = function() {
			return this.age;
		}
		var a = new A();
		var b = new B();
		soma.applyProperties(a, b, true, ['getAge']);
		expect(a.name).toEqual('john');
		expect(a.age).toEqual(32);
		expect(a.getAge()).toEqual(21);
		expect(function(){a.getName();}).toThrow();
	});

	it("augment", function () {
		var A = function(){
			this.name = 'john';
			this.age = 32;
		};
		var B = function(){
			this.name = 'david';
			this.age = 21;
		};
		B.prototype.getName = function() {
			return this.name;
		}
		B.prototype.getAge = function() {
			return this.age;
		}
		var a = new A();
		var b = new B();
		expect(b.getName()).toEqual('david');
		expect(b.getAge()).toEqual(21);
		soma.augment(A, B);
		expect(a.getName()).toEqual('john');
		expect(a.getAge()).toEqual(32);
	});

	it("augment list", function () {
		var A = function(){
			this.name = 'john';
			this.age = 32;
		};
		var B = function(){
			this.name = 'david';
			this.age = 21;
		};
		B.prototype.getName = function() {
			return this.name;
		}
		B.prototype.getAge = function() {
			return this.age;
		}
		var a = new A();
		var b = new B();
		expect(b.getName()).toEqual('david');
		expect(b.getAge()).toEqual(21);
		soma.augment(A, B, ['getName']);
		expect(a.getName()).toEqual('john');
		expect(function(){a.getAge();}).toThrow();
	});

	it("inherit", function () {
		var Father = function(){
			this.name = 'john';
			this.age = 32;
		};
		Father.prototype.getName = function() {
			return this.name;
		}
		var Son = function(){
			this.name = 'david';
			this.age = 21;
		};
		Son.prototype.getAge = function() {
			return this.age;
		}
		var father = new Father();
		expect(father.getName()).toEqual('john');
		expect(function(){father.getAge();}).toThrow();
		soma.inherit(Father, Son.prototype);
		var son = new Son();
		expect(son.getName()).toEqual('david');
		expect(son.getAge()).toEqual(21);
	});

	it("extend", function () {
		var Father = function(){
			this.type = 'male';
			this.name = 'john';
		};
		Father.prototype.getType = function() {
			return this.type;
		}
		Father.extend = function(obj) {
			return soma.inherit(Father, obj);
		};
		var Son = Father.extend({
			constructor: function() {
				Father.call(this);
				this.name = 'david';
			},
			getName: function() {
				return this.name;
			}
		});
		var father = new Father();
		expect(father.getType()).toEqual('male');
		expect(function(){father.getName();}).toThrow();
		var son = new Son();
		expect(son.getType()).toEqual('male');
		expect(son.getName()).toEqual('david');
	});

	it("extend parent constructor", function () {
		var Father = soma.extend({
			constructor: function() {
				this.type = 'male';
				this.name = 'john';
			},
			getType: function() {
				return this.type;
			}
		});
		Father.extend = function(obj) {
			return soma.inherit(Father, obj);
		};
		var Son = Father.extend({
			constructor: function() {
				Father.call(this);
				this.name = 'david';
			},
			getName: function() {
				return this.name;
			}
		});
		var father = new Father();
		expect(father.getType()).toEqual('male');
		expect(function(){father.getName();}).toThrow();
		var son = new Son();
		expect(son.getType()).toEqual('male');
		expect(son.getName()).toEqual('david');
	});

	it("extend call parent", function () {
		var Father = soma.extend({
			constructor: function() {
				this.name = 'john';
			},
			getName: function() {
				return this.name + ' super';
			}
		});
		Father.extend = function(obj) {
			return soma.inherit(Father, obj);
		};
		var Son = Father.extend({
			constructor: function() {
				Father.call(this);
				this.name = 'david';
			},
			getParentName: function() {
				return Father.prototype.getName.call(this);
			}
		});
		var father = new Father();
		expect(father.getName()).toEqual('john super');
		var son = new Son();
		expect(son.getName()).toEqual('david super');
	});

});