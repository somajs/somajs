;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.commands = sniply.commands || {};

	var LogoutCommand = function(userModel, snippetModel, dispatcher) {

		this.execute = function(event) {
			userModel.clear();
			snippetModel.clear();
			dispatcher.dispatch(sniply.events.RENDER_NAV);
			dispatcher.dispatch(sniply.events.RENDER_LIST);
			dispatcher.dispatch(sniply.events.NOTIFY, "User logged out.");
		};

	};

	// exports
	sniply.commands.LogoutCommand = LogoutCommand;

})(window.sniply = window.sniply || {});