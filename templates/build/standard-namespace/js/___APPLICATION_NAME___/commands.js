var ___APPLICATION_NAMESPACE___ = ___APPLICATION_NAMESPACE___ || {};

___APPLICATION_NAMESPACE___.ApplicationCommand = new Class({

	Extends:soma.core.controller.Command,

	execute: function(event) {
		switch(event.type) {
			case ___APPLICATION_NAMESPACE___.ApplicationEvent.SEND_MESSAGE:
				var message = this.getModel(___APPLICATION_NAMESPACE___.ApplicationModel.NAME).data;
				this.getWire(___APPLICATION_NAMESPACE___.ApplicationWire.NAME).updateMessage(message);
				break;
		}
	}

});
