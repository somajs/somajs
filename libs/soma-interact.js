;(function (soma, undefined) {

	'use strict';

	soma.interact = soma.interact || {};
	soma.interact.version = '0.0.1';

	var errors = soma.interact.errors = {

	};

	var maxDepth;
	var store = [];
	var settings = soma.interact.settings = soma.interact.settings || {};
	var attributes = settings.attributes = {};
	settings.prefix = 'data';

	var eventString = 'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup focus blur change select selectstart scroll copy cut paste mousewheel keypress error contextmenu input textinput drag dragenter dragleave dragover dragend dragstart dragover drop load submit reset search resize beforepaste beforecut beforecopy';
	var eventsArray = eventString.split(' ');
	var i = -1, l = eventsArray.length;
	while(++i < l) {
		attributes[settings.prefix + "-" + eventsArray[i]] = eventsArray[i];
	}

	function isElement(value) {
		return value ? value.nodeType > 0 : false;
	}

	function isFunction(value) {
		return value && typeof value === 'function';
	}

// written by Dean Edwards, 2005
// with input from Tino Zijdel, Matthias Miller, Diego Perini
// http://dean.edwards.name/weblog/2005/10/add-event/
	function addEvent(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else {
			// assign each event handler a unique ID
			if (!handler.$$guid) handler.$$guid = addEvent.guid++;
			// create a hash table of event types for the element
			if (!element.events) element.events = {};
			// create a hash table of event handlers for each element/event pair
			var handlers = element.events[type];
			if (!handlers) {
				handlers = element.events[type] = {};
				// store the existing event handler (if there is one)
				if (element["on" + type]) {
					handlers[0] = element["on" + type];
				}
			}
			// store the event handler in the hash table
			handlers[handler.$$guid] = handler;
			// assign a global event handler to do all the work
			element["on" + type] = handleEvent;
		}
	};
// a counter used to create unique IDs
	addEvent.guid = 1;
	function removeEvent(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else {
			// delete the event handler from the hash table
			if (element.events && element.events[type]) {
				delete element.events[type][handler.$$guid];
			}
		}
	};
	function handleEvent(event) {
		var returnValue = true;
		// grab the event object (IE uses a global event object)
		event = event || fixEvent(((this.ownerDocument || this.document || this).parentWindow || window).event);
		// get a reference to the hash table of event handlers
		var handlers = this.events[event.type];
		// execute each event handler
		for (var i in handlers) {
			this.$$handleEvent = handlers[i];
			if (this.$$handleEvent(event) === false) {
				returnValue = false;
			}
		}
		return returnValue;
	};
	function fixEvent(event) {
		// add W3C standard event methods
		event.preventDefault = fixEvent.preventDefault;
		event.stopPropagation = fixEvent.stopPropagation;
		return event;
	};
	fixEvent.preventDefault = function() {
		this.returnValue = false;
	};
	fixEvent.stopPropagation = function() {
		this.cancelBubble = true;
	};

// jquery contains
	var contains = document.documentElement.contains ?
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

	function getHandlerFromPattern(object, pattern, child) {
		var parts = pattern.match(/(.*)\((.*)\)/);
		if (parts) {
			var func = parts[1];
			if (isFunction(object[func])) {
				return object[func];
			}
		}
	}

	function parse(element, object, depth) {
		maxDepth = depth === undefined ? Number.MAX_VALUE : depth;
		parseNode(element, object, 0, true);
	}

	function parseNode(element, object, depth, isRoot) {
		if (!isElement(element)) throw new Error('Error in soma.interact.parse, only a DOM Element can be parsed.');
		if (isRoot) parseAttributes(element, object);
		var child = element.firstChild;
		while (child) {
			if (child.nodeType === 1) {
				if (depth < maxDepth) parseNode(child, object, depth++);
				parseAttributes(child, object);
			}
			child = child.nextSibling;
		}
	}

	function parseAttributes(element, object) {
		var attributes = [];
		for (var attr, name, value, attrs = element.attributes, j = 0, jj = attrs && attrs.length; j < jj; j++) {
			attr = attrs[j];
			if (attr.specified) {
				name = attr.name;
				value = attr.value;
				if (settings.attributes[name]) {
					var handler = getHandlerFromPattern(object, value, element);
					if (handler) {
						addEvent(element, settings.attributes[name], handler);
						addToStore(element, settings.attributes[name], handler);
					}
				}
			}
		}
	}

	function clear(element) {
		var i = store.length, l = 0;
		while (--i >= l) {
			var item = store[i];
			if (element === item.element || contains(element, item.element)) {
				removeEvent(item.element, item.type, item.handler);
				store.splice(i, 1);
			}
		}
	}

	function addToStore(element, type, handler) {
		store.push({element:element, type:type, handler:handler});
	}

// plugins

	soma.plugins = soma.plugins || {};

	function InteractPlugin(instance, injector) {

	}
	if (soma.plugins && soma.plugins.add) {
		soma.plugins.add(InteractPlugin);
	}

// exports
	soma.interact.parse = parse;
	soma.interact.clear = clear;
	soma.interact.addEvent = addEvent;
	soma.interact.removeEvent = removeEvent;

// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma-interact", soma.interact);
	}

// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma.interact;
		}
		exports = soma.interact;
	}

})(this['soma'] = this['soma'] || {});