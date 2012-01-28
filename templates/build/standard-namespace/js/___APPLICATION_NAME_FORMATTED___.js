var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.SomaApplication = new Class({

	Extends: soma.Application,

	init: function() {
		
	},

	registerModels: function() {
		this.addModel(___APPLICATION_NAMESPACE___.ApplicationModel.NAME, new ___APPLICATION_NAMESPACE___.ApplicationModel());
	},

	registerViews: function() {
		this.addView(___APPLICATION_NAMESPACE___.ApplicationView.NAME, new ___APPLICATION_NAMESPACE___.ApplicationView());
	},

	registerCommands: function() {
		this.addCommand(___APPLICATION_NAMESPACE___.ApplicationEvent.SEND_MESSAGE, ___APPLICATION_NAMESPACE___.ApplicationCommand);
	},

	registerWires: function() {
		this.addWire(___APPLICATION_NAMESPACE___.ApplicationWire.NAME, new ___APPLICATION_NAMESPACE___.ApplicationWire());
	},

	start: function() {
		this.dispatchEvent(new ___APPLICATION_NAMESPACE___.ApplicationEvent(___APPLICATION_NAMESPACE___.ApplicationEvent.SEND_MESSAGE));
	}

});

new ___APPLICATION_NAMESPACE___.SomaApplication();
