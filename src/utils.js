	soma.applyProperties = function(target, extension, bindToExtension, list) {
		if (Object.prototype.toString.apply(list) === '[object Array]') {
			for (var i = 0, l = list.length; i < l; i++) {
				if (target[list[i]] === undefined || target[list[i]] === null) {
					if (bindToExtension && typeof extension[list[i]] === 'function') {
						target[list[i]] = extension[list[i]].bind(extension);
					}
					else {
						target[list[i]] = extension[list[i]];
					}
				}
			}
		}
		else {
			for (var prop in extension) {
				if (bindToExtension && typeof extension[prop] === 'function') {
					target[prop] = extension[prop].bind(extension);
				}
				else {
					target[prop] = extension[prop];
				}
			}
		}
	};

	soma.augment = function (target, extension, list) {
		if (!extension.prototype || !target.prototype) {
			return;
		}
		if (Object.prototype.toString.apply(list) === '[object Array]') {
			for (var i = 0, l = list.length; i < l; i++) {
				if (!target.prototype[list[i]]) {
					target.prototype[list[i]] = extension.prototype[list[i]];
				}
			}
		}
		else {
			for (var prop in extension.prototype) {
				if (!target.prototype[prop]) {
					target.prototype[prop] = extension.prototype[prop];
				}
			}
		}
	};

	soma.inherit = function (parent, obj) {
		var Subclass;
		if (obj && obj.hasOwnProperty('constructor')) {
			// use constructor if defined
			Subclass = obj.constructor;
		} else {
			// call the super constructor
			Subclass = function () {
				return parent.apply(this, arguments);
			};
		}
		// set the prototype chain to inherit from the parent without calling parent's constructor
		var Chain = function(){};
		Chain.prototype = parent.prototype;
		Subclass.prototype = new Chain();
		// add obj properties
		if (obj) {
			soma.applyProperties(Subclass.prototype, obj);
		}
		// point constructor to the Subclass
		Subclass.prototype.constructor = Subclass;
		// set super class reference
		Subclass.parent = parent.prototype;
		// add extend shortcut
		Subclass.extend = function (obj) {
			return soma.inherit(Subclass, obj);
		};
		return Subclass;
	};

	soma.extend = function (obj) {
		return soma.inherit(function () {
		}, obj);
	};

	soma.browsers = soma.browsers || {};
	soma.browsers.ie = (function () {

		if (typeof document === 'undefined') {
			return undefined;
		}

		var div = document.createElement('div');

		if (typeof div.style.msTouchAction !== 'undefined') {
			return 10;
		}

		var v = 3, all = div.getElementsByTagName('i');

		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
				all[0]
			);

		return v > 4 ? v : undefined;

	}());

	soma.utils = soma.utils || {};
	soma.utils.HashMap = function(id) {
		var items = {};
		var count = 0;
		//var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
		function uuid() { return ++count + id; }
		function getKey(target) {
			if (!target) {
				return;
			}
			if (typeof target !== 'object') {
				return target;
			}
			var result;
			try {
				// IE 7-8 needs a try catch, seems like I can't add a property on text nodes
				result = target[id] ? target[id] : target[id] = uuid();
			} catch(err){}
			return result;
		}
		this.remove = function(key) {
			delete items[getKey(key)];
		};
		this.get = function(key) {
			return items[getKey(key)];
		};
		this.put = function(key, value) {
			items[getKey(key)] = value;
		};
		this.has = function(key) {
			return typeof items[getKey(key)] !== 'undefined';
		};
		this.getData = function() {
			return items;
		};
		this.dispose = function() {
			for (var key in items) {
				if (items.hasOwnProperty(key)) {
					delete items[key];
				}
			}
			this.length = 0;
		};
	}

	function parseDOM(self, element, updateData) {
		if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
			return;
		}
		for (var typeId in self.types) {
			var type = self.types[typeId];
			var name = type.name;
			var attrValue = element.getAttribute(name);
			if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
				var mediatorId = attrValue.split(self.attributeSeparator)[0];
				var mapping = type.getMapping(mediatorId);
				if (mapping) {
					var dataSource = getDataSource(self, element, type, attrValue);
					if (!type.get(element)) {
						type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataSource));
					}
					else {
						if (updateData) {
							updateMediatorData(self, type, attrValue, element);
						}
					}
				}
			}
		}
		var child = element.firstChild;
		while (child) {
			parseDOM(self, child, updateData);
			child = child.nextSibling;
		}
	}

	var regexFunction = /(.*)\((.*)\)/;
	var regexParams = /^(\"|\')(.*)(\"|\')$/;

	function parsePath(dataValue, dataPath) {
		console.log('======= PARSE DATA VALUE');
		console.log('======= dataValue', dataValue);
		console.log('======= dataPath', dataPath);
		if (dataPath !== undefined && dataValue !== undefined) {
			var val = dataValue;
			var path = dataPath.split('.');
			var step = path.shift();
            console.log('   step', step);
			while (step !== undefined) {
				var parts = step.match(regexFunction);
				if (parts) {
                    console.log('parts', parts);
					var params = parts[2];
					params = params.replace(/,\s+/g, '').split(',');
					for (var i=0, l=params.length; i<l; i++) {
						if (regexParams.test(params[i])) {
							params[i] = params[i].substr(1, params[i].length-2);
						}
					}
                    console.log('params', params);
                    console.log('compute on', val[parts[1]]);
                    console.log(111, val);
                    console.log(222, parts[1]);
                    console.log(333, val[parts[1]]);
					if (val[parts[1]] !== undefined) {
						val = val[parts[1]].apply(null, params);
					}
				}
				else {
					val = val[step];
				}
				console.log('VAL', val);
				if (val === undefined || val === undefined) {
					break;
				}
				step = path.shift()
			}
			dataValue = val;
		}
		return dataValue;
	}

	function parsePathParent(self, element, dataPath) {
		console.log('-------------');
		var result;
		var el = element.parentNode;
		while (el) {

			console.log('element', el);
			console.log('dataPath', dataPath);

			// do something

//			result = parsePath(dataValue, dataPath, self, el);

			//console.log('TYPES', self.types);


			for (var typeId in self.types) {
				var type = self.types[typeId];
				console.log('type', type);
				console.log('type.name', type.name);
				console.log('mediator', type.get(el));
				console.log('mediator', type.list.get(el));

				var listData = type.list.getData();

				for (var m in listData) {
					console.log(m, listData[m]);
				}

                console.log('EL', el);

                if (typeof el.getAttribute === 'function') {

                    var attrValue = el.getAttribute(type.name);
                    if (attrValue) {

                        var parts = attrValue.split(self.attributeSeparator);
                        var mediatorId = parts[0];

                        return resolveDataSource(self, el, type, mediatorId, dataPath);

                        console.log('RES', result);

                        //result = parsePath(dataSource, dataPath, self, el);

    //					if (result !== undefined) {
    //						break;
    //					}

                        }

    //				if (result !== undefined) {
    //					return result;
    //				}

                }



			}

			console.log('PARENT RESULT', result);

//			if (result !== undefined) {
//				return result;
//			}
//			else {
				return parsePathParent(self, el, dataPath);
//			}
//


			el = el.nextSibling;
		}
	}

	function getDataSource(self, element, type, attrValue) {
		var dataSource;
		var parts = attrValue.split(self.attributeSeparator);
		var mediatorId = parts[0];
		var dataPath = parts[1];
		var mapping = type.getMapping(mediatorId);
		if (mapping) {
			dataSource = resolveDataSource(self, element, type, mediatorId, dataPath);
		}
		return dataSource;
	}

	function resolveDataSource(self, element, mediatorType, mediatorId, dataPath) {
		var dataSource = mediatorType.getMappingData(mediatorId);
		console.log('DATA PATH', dataPath);
		console.log('DATA SOURCE', dataSource);
		console.log('MEDIATOR ID', mediatorId);
		if (dataPath) {
			var resultData = {};
			// http://regex101.com/r/nI3zQ7
			var dataPathList = dataPath.split(/,(?![\w\s'",\\]*\))/g);
			for (var s=0, d=dataPathList.length; s<d; s++) {
				var p = dataPathList[s].split(':');
				var name = p[0];
				var path = p[1];
				var parsedData;
				if (path) {
					// has injection name
					parsedData = parsePath(dataSource, path);
					resultData[name] = parsedData;
					if (parsedData === undefined) {
						resultData[name] = parsePathParent(self, element, path);
					}
				}
				else {
					parsedData = parsePath(dataSource, name);
					resultData['data'] = parsedData;
					if (parsedData === undefined) {
						parsedData = parsePathParent(self, element, name);
						console.log('-_-_-_- pARENT PARSED DATA', element, parsedData);
						resultData = parsedData;
					}
					if (parsedData === undefined || parsedData === null) {
						return parsedData;
					}
				}
			}
			console.log('>>>>>>>>>>>', element, resultData);
			return resultData;
		}
		return dataSource;
	}

	function applyMappingData(injector, data) {
		if (data === undefined || data === null) {
			return;
		}
		if (typeof data === 'object' && Object.prototype.toString.call(data) !== '[object Array]') {
			for (var name in data) {
				if (typeof name === 'string' && data[name] !== undefined && data[name] !== null) {
					injector.mapValue(name, data[name]);
				}
			}
		}
		if (!injector.hasMapping('data')) {
			injector.mapValue('data', data);
		}
	}

	function updateMediatorData(self, type, attrValue, target) {
		if (type && type.has(target)) {
			var dataSource = getDataSource(self, target, type, attrValue);
			var mediator = type.get(target);
			if (dataSource && mediator) {
				var injector = self.injector.createChild();
				injector.mapValue('target', target);
				if (typeof dataSource === 'function') {
					var result = dataSource(injector, i);
					if (result !== undefined && result !== null) {
						applyMappingData(injector, result);
					}
				}
				else if (dataSource !== undefined && dataSource !== null) {
					applyMappingData(injector, dataSource);
				}
				injector.inject(mediator, false);
			}
		}
	}

	function resolveMediatorData(injector, data) {
		if (typeof data === 'function' || data === undefined || data === null) {
			return data;
		}
		var resolvedData;
		if (typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') {
			resolvedData = data;
		}
		else {
			resolvedData = {};
			for (var name in data) {
				if (typeof data[name] === 'string' && injector.hasMapping(data[name])) {
					resolvedData[name] = injector.getValue(data[name]);
				}
				else {
					resolvedData[name] = data[name];
				}
			}
		}
		return resolvedData;
	}

	function inDOM(element) {
		if (!element.parentNode) {
			return typeof HTMLDocument !== 'undefined' && element instanceof HTMLDocument;
		}
		else {
			return inDOM(element.parentNode);
		}
	}

	var contains = typeof document !== 'object' ? function(){} : document.documentElement.contains ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
		} :
		document.documentElement.compareDocumentPosition ?
			function( a, b ) {
				return b && !!( a.compareDocumentPosition( b ) & 16 );
			} :
			function( a, b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
				return false;
			};