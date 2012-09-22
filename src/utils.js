	soma.applyProperties = function(target, extension, list) {
		if (typeof list === 'object' && list instanceof Array && list.length > 0) {
			var length = list.length;
			for (var i = 0; i < length; i++) {
				if (!target[list[i]]) {
					target[list[i]] = extension[list[i]].bind(extension);
				}
			}
		}
		else {
			for (var prop in extension) {
				target[prop] = extension[prop];
			}
		}
	};

	soma.augment = function (target, extension, list) {
		if (!target.prototype || !extension.prototype) return;
		if (typeof list === 'object' && list instanceof Array && list.length > 0) {
			var length = list.length;
			for (var i = 0; i < length; i++) {
				if (!target.prototype[list[i]] || override) {
					target.prototype[list[i]] = extension.prototype[list[i]];
				}
			}
		}
		else {
			for (var prop in extension.prototype) {
				if (!target.prototype[list[i]] || override) {
					target.prototype[list[i] = extension.prototype[list[i]]];
				}
			}
		}
	};

	soma.inherit = function (target, obj) {
		var subclass;
		if (obj && obj.hasOwnProperty('constructor')) {
			// use constructor if defined
			subclass = obj.constructor;
		} else {
			// call the super constructor
			subclass = function () {
				return target.apply(this, arguments);
			};
		}
		// add super properties
		soma.applyProperties(subclass.prototype, target.prototype);
		// set the prototype chain to inherit from the parent without calling parent's constructor
		var chain = function () {
		};
		chain.prototype = target.prototype;
		subclass.prototype = new chain();
		// add obj properties
		if (obj) soma.applyProperties(subclass.prototype, obj, target.prototype);
		// point constructor to the subclass
		subclass.prototype.constructor = subclass;
		// set super class reference
		subclass.parent = target.prototype;
		// add extend shortcut
		subclass.extend = function (obj) {
			return soma.inherit(subclass, obj);
		};
		return subclass;
	};

	soma.extend = function (obj) {
		return soma.inherit(function () {
		}, obj);
	};