;(function(sniply, undefined) {

	// package
	sniply.commands = sniply.commands || {};

	var NotifyCommand = function() {

		this.execute = function(event) {
			$('.bottom-right').notify({
				message: { text: event.params }
			}).show();
		}

	};

	// exports
	sniply.commands.NotifyCommand = NotifyCommand;

})(sniply = window.sniply || {});