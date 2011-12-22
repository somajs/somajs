soma.core.controller.SomaController.addInterceptor = function(commandName) {
			if (!soma["core"]) {
				throw new Error("soma package has been overwritten by local variable");
			}

			alert('ok')

			// handle events dispatched from the domTree
			this.instance.body.addEventListener(commandName, boundDomtree, true);

			// handle events dispatched from the Soma facade
			this.instance.addEventListener(commandName, boundInstance, Number.NEGATIVE_INFINITY);

		};

soma.EventDispatcher = (function() {
	var listeners = [];
	return new Class({
		initialize: function() {
			listeners = [];
		},
		addEventListener: function(type, listener, priority) {
			if (!listeners || !type || !listener) return;
			if (isNaN(priority)) priority = 0;
			listeners.push({type: type, listener: listener, priority: priority});
		},
		removeEventListener: function(type, listener) {
			if (!listeners || !type || !listener) return;
			var i = 0;
			var l = listeners.length;
			for (; i < l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type && eventObj.listener == listener) {
					listeners.splice(i, 1);
					return;
				}
			}
			return false;
		},
		hasEventListener: function(type) {
			if (!listeners || !type) return false;
			var i = 0;
			var l = listeners.length;
			for (; i < l; ++i) {
				var eventObj = listeners[i];
				if (eventObj.type == type) {
					return true;
				}
			}
			return false;
		},
		dispatchEvent: function(event) {
			if (!listeners || !event) return;
			var events = [];
			var i;
			for (i = 0; i < listeners.length; i++) {
				var eventObj = listeners[i];
				if (eventObj.type == event.type) {
					events.push(eventObj);
				}
			}
			events.sort(function(a, b) {
				return b.priority - a.priority;
			});
			for (i = 0; i < events.length; i++) {
				events[i].listener.apply(event.currentTarget, [event]);
			}
		},
		toString: function() {
			return "[Class soma.EventDispatcher]";
		},
		dispose: function() {
			listeners = null;
		}
	});
})();

soma.Event = new Class(
	{
		initialize: function(type, data, bubbles, cancelable) {
			if (document.createEvent) {
				var e = document.createEvent("Event");
				e.initEvent(type, bubbles !== undefined ? bubbles : true, cancelable !== undefined ? cancelable : false);
			}
			else {
				e = document.createEventObject();
				e.type = type;
			}
			e.cancelable = cancelable !== undefined ? cancelable : false;
			if (data) {
				for (var k in data) {
					e[k] = data[k];
				}
				e.data = data;
			}
			e.clone = this.clone.bind(e);
			e.isDefaultPrevented = this.isDefaultPrevented;
			return e;
		},
		clone: function() {
			var e = document.createEvent("Event");
			e.initEvent(this.type, this.bubbles, this.cancelable);
			var d = this.data;
			for (var k in d) {
				e[k] = d[k];
			}
			e.data = d;
			e.isCloned = true;
			e.clone = this.clone;
			e.isDefaultPrevented = this.isDefaultPrevented;
			return e;
		},
		isDefaultPrevented: function() {
			if (this.getDefaultPrevented) {
				return this.getDefaultPrevented();
			} else {
				return this.defaultPrevented;
			}
		}
	});


soma.View = new Class({

	domElement: null,
	instance: null,

	initialize: function(domElement) {
		var d;
		if( domElement != undefined ) {
			if( domElement instanceof Element ) {
				d = domElement;
			}else{
				throw Error( "domElement has to be a DOM-ELement");
			}
		}else{
			d = document.body;
		}
		this.domElement = d;
	},
	dispatchEvent: function(event) {
		this.domElement.dispatchEvent(event);
	},
	addEventListener: function() {
		this.domElement.addEventListener.apply(this.domElement, arguments);
	},
	removeEventListener: function() {
		this.domElement.removeEventListener.apply(this.domElement, arguments);
	},
	dispose: function() {

	}
});
