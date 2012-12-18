;(function(sniply, undefined) {

	// package
	sniply.commands = sniply.commands || {};

	// commands

	function SyncCommand(userModel, snippetModel, dispatcher, api, queue) {
		this.execute = function(event) {

			var user = userModel.getUser();
			if (user) {

				var apiSnippets = userModel.getUser().snippets,
					localSnippets = snippetModel.get(),
					localSnippetsToSync = localSnippets.concat();

				if (apiSnippets) {
					// add remote to local
					apiSnippets.forEach(function(item, index) {
						var res = localSnippets.filter(function(it) {
							var eq = item._id === it._id;
							if (eq) localSnippetsToSync.splice(it, 1);
							return eq;
						});
						if (res.length === 0) {
//							console.log('> copy remote to local', item);
							localSnippets.push(item);
						}
					});
				}

				// add local to remote
				if (localSnippetsToSync.length > 0) {
//					console.log('> copy local to remote', localSnippetsToSync);
					queue.add(api, 'addSnippets', [user._id, localSnippetsToSync], function(data) {
						userModel.updateUserApiSnippets(localSnippets.concat());
					}, function(err) {
						console.log('Error saving the local snippets to remote');
					});
				}

				// save local storage
				snippetModel.set(localSnippets);
				dispatcher.dispatch('render-list');
			}
		}
	}

	function LogoutCommand(userModel, snippetModel, dispatcher) {
		this.execute = function(event) {
			userModel.clear();
			snippetModel.clear();
			dispatcher.dispatch('render-nav');
			dispatcher.dispatch('render-list');
		}
	}

	// exports
	sniply.commands.SyncCommand = SyncCommand;
	sniply.commands.LogoutCommand = LogoutCommand;

})(sniply = window.sniply || {});