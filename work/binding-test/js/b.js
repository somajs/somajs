// from simpli5 framework
var PropertyChange;
var Bind;
var BindableArray;

(function() {

	PropertyChange = {

		/**
		 *
		 * @param obj
		 * @param property
		 * @param observer
		 * @param [allTypes]
		 */
		observe: function(obj, property, observer, allTypes) {
			var props = property.split(/\s*,\s*/);
			var properties = obj.__observers__;
			if (!properties) {
				obj.__observers__ = properties = {};
			}

			for (var i = 0, l = props.length; i < l; i++) {
				property = props[i];
				if (typeof obj == 'function' && allTypes) {
					property = '(' + property + ')';
				}
				if (!this.isObservable(obj, property)) {
					this.makeObservable(obj, property);
				}
				var observers = properties[property];
				if (!observers) {
					properties[property] = observers = [];
				}
				if (observers.indexOf(observer) == -1) observers.push(observer);
			}
		},

		unobserve: function(obj, property, observer) {
			var props = property.split(/\s*,\s*/);
			var properties = obj.__observers__;
			if (!properties) return;

			for (var i = 0, l = props.length; i < l; i++) {
				property = props[i];
				var observers = properties[property];
				if (!observers) continue;
				var index = observers.indexOf(observer);
				observers.splice(index, 1);
			}
		},

		dispatch: function(obj, property, oldValue, newValue, force) {
			if (!force && oldValue === newValue) return;
			var properties = obj.__observers__, i, l;
			if (!properties) return;

			var observers = [].concat(properties[property] || []).concat(properties['*'] || []);
			for (i = 0, l = observers.length; i < l; i++) {
				observers[i](property, oldValue, newValue, obj);
			}

			var constructor = obj.constructor;
			property = '(' + ')';
			while (constructor) {
				properties = constructor.__observers__;
				constructor = constructor.prototype.__proto__ ? constructor.prototype.__proto__.constructor : null;
				if (!properties) continue;

				observers = [].concat(properties[property] || []).concat(properties['(*)'] || []);
				for (i = 0, l = observers.length; i < l; i++) {
					observers[i](property, oldValue, newValue, obj);
				}
			}
		},

		isObservable: function(obj, property) {
			var setter = obj.__lookupSetter__(property);
			if (setter && setter.observable) return true;
			if (!setter || setter.toString().indexOf('PropertyChange.dispatch') == -1) {
				return false;
			} else {
				setter.observable = true;
				return true;
			}
		},

		makeObservable: function(obj, property) {
			var getter = obj.__lookupGetter__(property);
			var setter = obj.__lookupSetter__(property);

			if (getter && setter) {
				obj.__defineSetter__(property, function(value) {
					var oldValue = getter.call(obj);
					if (oldValue == value) return;
					setter.call(this, value);
					value = getter.call(obj);
					PropertyChange.dispatch(obj, property, oldValue, value);
				});
			} else if (!getter) { // if read-only don't change, dev's job to dispatch the change
				var prop = obj[property];
				obj.__defineGetter__(property, function() { return prop; });
				obj.__defineSetter__(property, function(value) {
					var oldValue = prop;
					if (oldValue == value) return;
					prop = value;
					PropertyChange.dispatch(obj, property, oldValue, value);
				});
				obj.__lookupSetter__(property).observable = true;
			}
		}
	};


	Bind = {

		property: function(source, sourceProp, target, targetProp, twoWay) {
			var binding = new Binding(source, sourceProp, target, targetProp, twoWay);
			var bindings = source.__bindings__;
			if (!bindings) {
				source.__bindings__ = bindings = [];
			}
			bindings.push(binding);
			bindings = target.__bindings__;
			if (!bindings) {
				target.__bindings__ = bindings = [];
			}
			bindings.push(binding);
		},

		setter: function(source, sourceProp, setter) {
			var binding = new Binding(source, sourceProp, setter);
			var bindings = source.__bindings__;
			if (!bindings) {
				source.__bindings__ = bindings = [];
			}
			bindings.push(binding);
		},

		removeProperty: function(source, sourcePath, target, targetPath, twoWay) {
			var bindings = source.__bindings__;
			var targetBindings = target.__bindings__;
			if (!bindings || !targetBindings) return;

			for (var i = 0, l = bindings.length; i < l; i++) {
				var binding = bindings[i];
				if (binding.matches(source, sourcePath, target, targetPath, twoWay)) {
					binding.release();
					bindings.splice(i, 1);
					var index = targetBindings.indexOf(binding);
					if (index != -1) targetBindings.splice(index, 1);
					break;
				}
			}
		},

		removeSetter: function(source, sourcePath, setter) {
			var bindings = source.__bindings__;
			if (!bindings) return;

			for (var i = 0, l = bindings.length; i < l; i++) {
				var binding = bindings[i];
				if (binding.matches(source, sourcePath, setter)) {
					binding.release();
					bindings.splice(i, 1);
					break;
				}
			}
		},

		removeAll: function(target) {
			var bindings = target.__bindings__, index;
			if (!bindings) return;

			for (var i = 0, l = bindings.length; i < l; i++) {
				var binding = bindings[i];
				if (binding.source.length) {
					var bindSource = binding.source[0];
					index = bindSource.__bindings__.indexOf(binding);
					if (index != -1) bindSource.__bindings__.splice(index, 1);
				}
				if (binding.target.length) {
					var bindTarget = binding.target[0];
					index = bindTarget.__bindings__.indexOf(binding);
					if (index != -1) bindTarget.__bindings__.splice(index, 1);
				}
				binding.release();
			}
			bindings.length = 0;
		}

	};

	var Binding = new Class({

		constructor: function(source, sourcePath, target, targetPath, twoWay) {
			this.onChange = this.onChange.bind(this);
			this.source = [];
			this.target = [];
			this.reset(source, sourcePath, target, targetPath, twoWay);
		},

		matches: function(source, sourcePath, target, targetPath, twoWay) {
			if (typeof target == 'function' && targetPath == null) {
				return (this.source[0] == source && this.sourcePath.join('.') == sourcePath && this.setter == target);
			} else {
				return (this.source[0] == source && this.sourcePath.join('.') == sourcePath && this.target[0] == target && this.targetPath.join('.') == targetPath && this.twoWay == twoWay);
			}
		},

		release: function() {
			this.unbindPath('source', 0);
			this.unbindPath('target', 0);
			this.setter = null;
			this.sourcePath = null;
			this.targetPath = null;
			this.twoWay = false;
			this.sourceResolved = false;
			this.targetResolved = false;
			this.value = undefined;
		},

		reset: function(source, sourcePath, target, targetPath, twoWay) {
			this.release();
			this.twoWay = twoWay;

			if (typeof target == 'function' && targetPath == null) {
				this.setter = target;
				this.targetPath = [];
			} else {
				this.targetPath = targetPath.split('.');
			}
			this.sourcePath = sourcePath.split('.');

			this.bindPath('target', target, 0);
			this.update('source', source, 0);
		},

		bindPath: function(base, item, pathIndex) {
			var i, length, path = this[base + 'Path'], property, objs = this[base];

			this.unbindPath(base, pathIndex);

			for (i = pathIndex, length = path.length; i < length; i++) {
				if (item == null) break;
				objs[i] = item;
				property = path[i];
				if (pathIndex < length - 1 || this.twoWay || base == 'source') {
					PropertyChange.observe(item, property, this.onChange);
				}
				item = item[property];
			}
			this[base + 'Resolved'] = (i == length || item != null);
			return this[base + 'Resolved'] ? item : undefined;
		},

		unbindPath: function(base, pathIndex) {
			var path = this[base + 'Path'], objs = this[base], i = objs.length;

			while (i-- > pathIndex) {
				PropertyChange.unobserve(objs[i], path[i], this.onChange);
			}

			objs.length = pathIndex;
		},

		update: function(base, item, pathIndex) {
			pathIndex = pathIndex || 0;

			var oldValue = this.value;
			this.value = this.bindPath(base, item, pathIndex);

			this.updating = true;
			if (this.setter) {
				var target = this.source[this.source.length - 1];
				this.setter.call(target, this.sourcePath[this.sourcePath.length - 1], oldValue, this.value, target);
			}

			var otherBase = (base == 'source' ? 'target' : 'source');
			var resolved = this[otherBase + 'Resolved'];
			if (resolved) {
				var otherPath = this[otherBase + 'Path'];
				var otherItem = this[otherBase][otherPath.length - 1];
				if (otherItem) {
					var prop = otherPath[otherPath.length - 1];
					otherItem[prop] = this.value;
				}
			}
			this.updating = false;
		},

		onChange: function(property, oldValue, newValue, target) {
			if (this.updating) return;
			var pathIndex, prop;

			if ( (pathIndex = this.source.indexOf(target)) != -1) {
				prop = this.sourcePath[pathIndex];
				if (prop == property) {
					this.update('source', newValue, pathIndex + 1);
					return; // done
				}
			}

			if ( (pathIndex = this.target.indexOf(target)) != -1) {
				prop = this.targetPath[pathIndex];

				if (prop == property) {
					if (this.twoWay) {
						this.update('target', newValue, pathIndex + 1);
					} else {
						this.bindPath('target', newValue, pathIndex + 1);
						if (this.sourceResolved && this.targetResolved) {
							target = this.target[this.targetPath.length - 1];
							prop = this.targetPath[this.targetPath.length - 1];
							target[prop] = this.value;
						}
					}
				}
			}
		}
	});

	BindableArray = new Class({
		extend: Array,
		implement: EventDispatcher,

		push: function() {
			var items = toArray(arguments);
			var result = Array.prototype.push.apply(this, items);
			this.dispatchEvent(new ArrayChangeEvent('add', this.length - items.length, this.length - 1, items));
			return result;
		},

		pop: function() {
			var result = Array.prototype.pop.call(this);
			this.dispatchEvent(new ArrayChangeEvent('remove', this.length, this.length, [result]));
			return result;
		},

		shift: function() {
			var result = Array.prototype.shift.call(this);
			this.dispatchEvent(new ArrayChangeEvent('remove', 0, 0, [result]));
			return result;
		},

		unshift: function() {
			var items = toArray(arguments);
			var result = Array.prototype.unshift.apply(this, items);
			this.dispatchEvent(new ArrayChangeEvent('add', 0, items.length, items));
			return result;
		},

		splice: function(index, howmany, element1) {
			var args = toArray(arguments);
			var items = args.slice(2);
			var result = Array.prototype.splice.apply(this, args);

			if (result.length) {
				this.dispatchEvent(new ArrayChangeEvent('remove', index, result.length - 1, result));
			}
			if (items.length) {
				this.dispatchEvent(new ArrayChangeEvent('add', index, items.length - 1, items));
			}
			return result;
		},

		sort: function() {
			var args = toArray(arguments);
			var result = Array.prototype.sort.apply(this, args);
			this.dispatchEvent(new ArrayChangeEvent('reset', 0, this.length - 1, this));
			return result;
		},

		reverse: function() {
			var result = Array.prototype.reverse.call(this);
			this.dispatchEvent(new ArrayChangeEvent('reset', 0, this.length - 1, this));
			return result;
		}
	});

})();