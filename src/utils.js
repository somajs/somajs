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
		function uuid() { return ++count; }
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
		};
	};

	var regexFunction = /(.*)\((.*)\)/;
	var regexParams = /^(\"|\')(.*)(\"|\')$/;

	function parsePath(dataValue, dataPath) {
		console.log('PARSE PATH', dataValue, dataPath);
		if (dataPath !== undefined && dataValue !== undefined) {
			var step, val = dataValue;
			var path = dataPath.split('.');
			while (step = path.shift()) {
				var parts = step.match(regexFunction);
				if (parts) {
					var params = parts[2];
					params = params.replace(/,\s+/g, '').split(',');
					for (var i=0, l=params.length; i<l; i++) {
						if (regexParams.test(params[i])) {
							params[i] = params[i].substr(1, params[i].length-2);
						}
					}
					console.log('VAL', val);
					console.log('VAL', parts);
					val = val[parts[1]].apply(null, params);
				}
				else {
					val = val[step];
				}
			}
			dataValue = val;
		}
		return dataValue;
	}

	function getTypedAttributes(self, element) {
		var list = [];
		for (var attr, name, value, attrs = element.attributes, j = 0, jj = attrs && attrs.length; j < jj; j++) {
			attr = attrs[j];
			if (attr.specified) {
				name = attr.name;
				value = attr.value;
				if (self.types[name]) {
					list.push(attr);
				}
			}
		}
		return list;
	}

	function getDataFromParentMediators(self, element, dataPath) {
		console.log('> getDataFromParentMediators', dataPath);
		var target = element.parentNode;
		if (target) {
			var mediator = self.get(target);
			console.log(':::::::', mediator, typeof mediator);
			if (mediator) {
				var value = parsePath(mediator, dataPath);
				if (value !== undefined) {
					return value;
				}
				else {
					return getDataFromParentMediators(self, target, dataPath);
				}
			}
		}


//		var attr = element.getAttribute(this.attribute);
//		if (attr) {
//			var parts = attr.split(this.attributeSeparator);
//			if (parts[0] && this.has(element)) {
//				this.remove(element);
//			}
//		}
//		var child = element.firstChild;
//		while (child) {
//			this.parseToRemove(child);
//			child = child.nextSibling;
//		}
	}

	function parseDOM(self, element) {
		if (!element || !element.nodeType || element.nodeType === 8 || element.nodeType === 3 || typeof element['getAttribute'] === 'undefined') {
			return;
		}

		console.log('attribute list', getTypedAttributes(self, element));

		var typedList = getTypedAttributes(self, element);

		for (var i=0, l=typedList.length; i<l; i++) {

			var attr = typedList[i];
			console.log('----- attr', attr);
			console.log('----- type', self.types[attr.name]);
			var type = self.types[attr.name];
			if (attr && type) {
				var parts = attr.value.split(self.attributeSeparator);
				var mediatorId = parts[0];
				var dataPath = parts[1];
				console.log('-- data path', dataPath);
				console.log('mediatorId', mediatorId, type.mappings[mediatorId]);
				if (mediatorId && type.mappings[mediatorId]) {
					console.log('type.has(element)', type.has(element));
					if (!type.has(element)) {
						var dataSource = type.getMappingData(mediatorId) || {};
						if (!dataPath) {
							type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataSource));
						}
						else {
							console.log('DATA PATH', dataPath);
							var dataPathList = dataPath.split(/\s?,\s?/g);
							console.log('DATA PATH LIST', dataPathList);
							for (var s=0, d=dataPathList.length; s<d; s++) {
								console.log('>>>>', s, dataPathList[s]);
								var p = dataPathList[s].split(':');
								var name = p[0];
								console.log('----------- dataSource[name]', name, dataSource[name]);
								if (dataSource[name]) {
									console.log('p.length', p.length, p);
									dataSource[name] = parsePath(dataSource[name], p[1]);
								}
								else {
									dataSource[name] = getDataFromParentMediators(self, element, p[1]);
									console.log('FOUND', name, dataSource[name]);
								}
							}
							type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataSource));
						}



//
//
//
//
//
//
//
//						var dataSource = type.getMappingData(mediatorId);
//						console.log('DATA SOURCE', dataSource);
//						if (dataSource) {
//							if (dataPath) {
//								console.log('DATA PATH', dataPath);
//								var dataPathList = dataPath.split(/\s?,\s?/g);
//								console.log('DATA PATH LIST', dataPathList);
//								for (var s=0, d=dataPathList.length; s<d; s++) {
//									var p = dataPathList[i].split(':');
//									var name = p[0];
//									console.log('dataSource[name]', dataSource[name]);
//									if (dataSource[name]) {
//										console.log('p.length', p.length, p);
//										if (p.length > 0) {
//											console.log('has path');
//											dataSource[name] = parsePath(dataSource[name], p[1]);
//										}
//										else {
//											console.log('has no path');
//										}
//									}
//								}
//							}
//							type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataSource));
//						}
//						else {
//							dataSource = getDataFromParentMediators(self, element, dataPath);
//							type.add(element, self.create(type.mappings[mediatorId].mediator, element));
//						}
















//						var dataSource = type.getMappingData(mediatorId);
//						if (dataSource) {
//							var dataValue = parsePath(dataSource, dataPath);
//							console.log('CREATE WITH DATA SOURCE', dataValue);
//							type.add(element, self.create(type.mappings[mediatorId].mediator, element, dataValue));
//						}
//						else {
//							if (!dataPath) {
//								type.add(element, self.create(type.mappings[mediatorId].mediator, element));
//							}
//							else {
//								// has a data path but not data source
//								console.log('FOUND IT!!!', getDataFromParentMediators(self, element, dataPath));
//								type.add(element, self.create(type.mappings[mediatorId].mediator, element, getDataFromParentMediators(self, element, dataPath)));
//							}
//						}

					}
				}
			}

		}

		var child = element.firstChild;
		while (child) {
			parseDOM(self, child);
			child = child.nextSibling;
		}
	}

	function applyMappingData(injector, obj) {
		for (var name in obj) {
			if (typeof name === 'string') {
				console.log('APPLY', name, obj[name]);
				injector.mapValue(name, obj[name]);
			}
		}
	}