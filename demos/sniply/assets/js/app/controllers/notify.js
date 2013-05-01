;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.commands = sniply.commands || {};

	var NotifyCommand = function() {

		this.execute = function(event) {
			$('.bottom-right').notify({
				message: { text: event.params }
			}).show();
		};

	};

	// exports
	sniply.commands.NotifyCommand = NotifyCommand;

})(window.sniply = window.sniply || {});