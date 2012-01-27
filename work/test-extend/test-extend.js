var soma = {};

Object.prototype.applyProperties = function(target, extension) {
	for (var prop in extension) {
		target[prop] = extension[prop];
	}
}

Object.prototype.inherit = function(target, obj) {
	var subclass;
	if (obj && obj.hasOwnProperty('constructor')) {
		// use constructor if defined
		subclass = obj.constructor;
	} else {
		// call the super constructor
		subclass = function(){
			return target.apply(this, arguments);
		};
	}
	// add super properties
	subclass.applyProperties(subclass.prototype, target.prototype);
	// add obj properties
	subclass.applyProperties(subclass.prototype, obj);
	// point constructor to the subclass
	subclass.prototype.constructor = subclass;
	// set super class reference
	subclass.parent = target.prototype;
	return subclass;
};

soma.Wire = function(name) {
	this.name = name;
};
soma.Wire.extend = function(obj) {
	return obj.inherit(soma.Wire, obj);
}
soma.Wire.prototype = {
	say: function() {
		console.log("[SUPER] my name is:", this.name);
	}
}

// ******** USAGE ******************************************************

var MyWire = soma.Wire.extend({
	constructor: function(name) {
		soma.Wire.apply(this, arguments);
		console.log("constructor");
	}
//	say: function() {
//		console.log("[SUB] my name is:", this.name);
//	}
});

var sub1 = new MyWire("blah");
sub1.say();

var sub2 = new soma.Wire("es");
sub2.say();