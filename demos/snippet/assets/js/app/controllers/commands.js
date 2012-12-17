;(function(sniply, undefined) {

	// package
	sniply.commands = sniply.commands || {};

	// commands

	function SyncCommand(userModel, snippetModel, dispatcher, api, queue) {
		this.execute = function(event) {

			var user = userModel.getUser();
			if (user && !snippetModel.isSyncing) {

				var apiSnippets = userModel.getUser().snippets,
					localSnippets = snippetModel.get(),
					localSnippetsToSync = localSnippets.concat();

				// add remote to local
				apiSnippets.forEach(function(item, index) {
					var res = localSnippets.filter(function(it) {
						var eq = item._id === it._id;
						if (eq) localSnippetsToSync.splice(it, 1);
						return eq;
					});
					if (res.length === 0) {
//						console.log('> copy remote to local', item);
						localSnippets.push(item);
					}
				});

				// add local to remote
				if (localSnippetsToSync.length > 0) {
//					console.log('> copy local to remote', localSnippetsToSync);
					queue.add(api, 'addSnippets', [user._id, localSnippetsToSync], function(data) {
						snippetModel.isSyncing = false;
						userModel.updateUserApiSnippets(snippetModel.get());
						console.log('synced');
					}, function(err) {
						snippetModel.isSyncing = false;
						console.log('Error saving the local snippets to remote');
					});
				}
				else {
					snippetModel.isSyncing = false;
				}
				// save local storage
				snippetModel.set(localSnippets);
				dispatcher.dispatch('render-list');
			}
		}
	}

	// exports
	sniply.commands.SyncCommand = SyncCommand;

})(sniply = window.sniply || {});