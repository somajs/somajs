;
(function (ns, undefined) {

	var obj = {};
	var prop = 'name';

	var currentValue = obj[prop];

	var getFn = function() {
		alert('get: ' + currentValue);
		return currentValue;
	};
	var setFn = function(newValue) {
		alert('set: ' + newValue);
		currentValue = newValue;
	};

	if (typeof Object.defineProperty === 'function') {
		// modern browsers (need a try-catch for IE8)
		try {
			Object.defineProperty(obj, prop, {
				get: getFn,
				set: setFn
			});
		} catch(err) {}
	}
	else if (typeof obj.__defineGetter__ === 'function') {
		// old mozilla
		obj.__defineGetter__(prop, getFn);
		obj.__defineSetter__(prop, setFn);
	}
	else {
		var fake = document.createElement('fake');
		document.body.appendChild(fake);
		var onPropertyChange = function (event) {
			if (event.propertyName == prop) {
				// temporarily remove the event so it doesn't fire again and create a loop
				fake.detachEvent("onpropertychange", onPropertyChange);
				// get the changed value, run it through the set function
				//alert(setFn.toString())
				var newValue = setFn(fake[prop]);
				// restore the get function
				fake[prop] = getFn;
				fake[prop].toString = getFn;
				// restore the event
				fake.attachEvent("onpropertychange", onPropertyChange);
			}
		}

		fake[prop] = getFn;
		fake[prop].toString = getFn;

		fake.attachEvent("onpropertychange", onPropertyChange);
		//fake[prop] = "ok"

	}

	alert('--> test1: ' + obj[prop]);
	obj[prop] = "John";
	alert('--> test2: ' + obj[prop]);


//	// Super amazing, cross browser property function, based on http://thewikies.com/
//	function addProperty(obj, name, onGet, onSet) {
//
//		// wrapper functions
//		var
//			oldValue = obj[name],
//			getFn = function () {
//				alert('get')
//				return onGet.apply(obj, [oldValue]);
//			},
//			setFn = function (newValue) {
//				alert('set')
//				return oldValue = onSet.apply(obj, [newValue]);
//			};
//
//		console.log(getFn);
//
//		// Modern browsers, IE9+, and IE8 (must be a DOM object),
//		if (Object.defineProperty) {
//
//			console.log(1);
//
//			Object.defineProperty(obj, name, {
//				get:getFn,
//				set:setFn
//			});
//
//			// Older Mozilla
//		} else if (obj.__defineGetter__) {
//
//			console.log(2);
//
//			obj.__defineGetter__(name, getFn);
//			obj.__defineSetter__(name, setFn);
//
//			// IE6-7
//			// must be a real DOM object (to have attachEvent) and must be attached to document (for onpropertychange to fire)
//		} else {
//
//			var onPropertyChange = function (e) {
//
//				if (event.propertyName == name) {
//					// temporarily remove the event so it doesn't fire again and create a loop
//					obj.detachEvent("onpropertychange", onPropertyChange);
//
//					// get the changed value, run it through the set function
//					var newValue = setFn(obj[name]);
//
//					// restore the get function
//					obj[name] = getFn;
//					obj[name].toString = getFn;
//
//					// restore the event
//					obj.attachEvent("onpropertychange", onPropertyChange);
//				}
//			};
//
//			obj[name] = getFn;
//			obj[name].toString = getFn;
//
//			obj.attachEvent("onpropertychange", onPropertyChange);
//
//		}
//	}
//
//	var obj = {};
//	var prop = 'name';
//	addProperty(obj, prop,
//	function() {
//		alert('GET: ' + prop);
//		return this[prop];
//	},
//	function(value) {
//		alert('SET: ' + prop);
//		this[prop] = value;
//	});
//
//	alert("test 1: " + obj.name)
//	obj.name = "John";
//	alert("test 2: " + obj.name)


//	// must be a DOM object (even if it's not a real tag) attached to document
//	var myObject = document.createElement('fake');
//	document.body.appendChild(myObject);
//
//	// create property
//	myObject.firstName = 'John';
//	myObject.lastName = 'Dyer';
//	addProperty(myObject, 'fullname',
//		function () {
//			return this.firstName + ' ' + this.lastName;
//		},
//		function (value) {
//			var parts = value.split(' ');
//			this.firstName = parts[0];
//			this.lastName = (parts.length > 1) ? parts[1] : '';
//		});
//
//	console.log(myObject.fullname); // returns 'John Dyer'


})(this['ns'] = this['ns'] || {});