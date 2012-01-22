ApplicationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, data, bubbles, cancelable) {
		return this.parent(type, data, bubbles, cancelable);
	}

});
ApplicationEvent.SETUP = "ApplicationEvent.SETUP";

NavigationEvent = new Class({

	Extends: soma.Event,

	initialize: function(type, navigationId, bubbles, cancelable) {
		return this.parent(type, {navigationId:navigationId}, bubbles, cancelable);
	}

});
NavigationEvent.SELECT = "NavigationEvent.SELECT";

