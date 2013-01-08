;(function(sniply, undefined) {

	// package
	sniply.commands = sniply.commands || {};

	// commands

	function SyncCommand(userModel, snippetModel, dispatcher, api, queue) {
		this.execute = function(event) {

			var user = userModel.getUser();
			if (user) {

				var localSnippets = snippetModel.get();
				var remoteSnippets = userModel.getUser().snippets;

				// ***** REMOTE TO LOCAL

				// todo: FORCE AN UPDATE OF THE LOCAL ONE IF NO "ADDED" or "DELETED"
				// in case of 2 different computers, older local values must be updated
				// might need to implement something with a modification timestamp

				var remoteSnippets = userModel.getUser().snippets;
				remoteSnippets.forEach(function(item, index) {
					var found = false;
					for (var i= 0, l=localSnippets.length; i < l; i++) {
						if (item._id === localSnippets[i]._id) {
							found = true;
							break;
						}
					}
					if (!found) {
						localSnippets.push(item);
					}
				});
				snippetModel.set(localSnippets);

				// ***** LOCAL TO REMOTE

				// delete snippets in remote
				var deletedSnippets = [];
				var deletedSnippetsToSync = [];
				localSnippets.forEach(function(item, index) {
					if (item.deleted) {
						deletedSnippetsToSync.push(item._id);
						deletedSnippets.push(item);
					}
				});
				if (deletedSnippetsToSync.length > 0) {
					queue.add(api, 'deleteSnippets', [userModel.getAccessToken(), user._id, deletedSnippetsToSync], function(data) {
						snippetModel.clearDeleted(deletedSnippets);
						userModel.updateUserApiSnippets(localSnippets.concat());
					}, function(err) {
						console.log('API Error deleting a snippet', err);
					});
				}

				// add snippets to remote
				var addedSnippets = [];
				localSnippets.forEach(function(item, index) {
					if (item.added) {
						console.log('ADDED>>>>', item);
						addedSnippets.push(item);
					}
				});
				if (addedSnippets.length > 0) {
					queue.add(api, 'addSnippets', [userModel.getAccessToken(), user._id, addedSnippets], function(data) {
						snippetModel.clearAdded(addedSnippets);
						userModel.updateUserApiSnippets(localSnippets.concat());
					}, function(err) {
						console.log('Error saving the local snippets to remote');
					});
				}

			}

			dispatcher.dispatch('render-list');

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