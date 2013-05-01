;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.commands = sniply.commands || {};

	var SyncCommand = function(userModel, snippetModel, dispatcher, api, queue) {

		this.execute = function(event) {

			var user = userModel.getUser();
			if (user) {

				var localSnippets = snippetModel.get();
				var remoteSnippets = userModel.getUser().snippets;
				var deletedSnippets = [];
				var deletedSnippetsToSync = [];
				var addedSnippets = [];

				// ***** REMOTE TO LOCAL

				// check for deleted snippets

				for (var j=localSnippets.length-1, k=0; j>=k; j--) {
					var found = false;
					for (var s= 0, d=remoteSnippets.length; s < d; s++) {
						if (localSnippets[j]._id === remoteSnippets[s]._id) {
							found = true;
						}
					}
					if (!found && !localSnippets[j].added && !localSnippets[j].deleted) {
						localSnippets.splice(j, 1);
					}
				}

				remoteSnippets.forEach(function(item, index) {
					var currentSnippet;
					var currentSnippetIndex;
					for (var i= 0, l=localSnippets.length; i < l; i++) {
						if (item._id === localSnippets[i]._id) {
							currentSnippet = localSnippets[i];
							currentSnippetIndex = i;
							break;
						}
					}
					if (!currentSnippet) {
						// snippet doesn't exist locally
						localSnippets.push(item);
					}
					else {
						// snippet exists locally, compare dates
						var localDate = parseInt(currentSnippet.modificationDate, 10);
						var remoteDate = parseInt(item.modificationDate, 10);
						if (remoteDate > localDate) {
							// remote more recent, overwrite local snippet
							localSnippets[currentSnippetIndex] = item;
						}
						else {
							if (!localSnippets[currentSnippetIndex].added) {
								// local more recent
								// if not flagged as added by the user: push in the list to send to the server
								addedSnippets.push(localSnippets[currentSnippetIndex]);
							}
						}
					}
				});
				snippetModel.set(localSnippets);

				// ***** LOCAL TO REMOTE

				// delete snippets in remote
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
						dispatcher.dispatch(sniply.events.NOTIFY, "Snippets deleted on server.");
					}, function(err) {
						console.log('API Error deleting a snippet', err);
					});
				}

				// add snippets to remote
				localSnippets.forEach(function(item, index) {
					if (item.added) {
						addedSnippets.push(item);
					}
				});
				if (addedSnippets.length > 0) {
					queue.add(api, 'addSnippets', [userModel.getAccessToken(), user._id, addedSnippets], function(data) {
						snippetModel.clearAdded(addedSnippets);
						userModel.updateUserApiSnippets(localSnippets.concat());
						dispatcher.dispatch(sniply.events.NOTIFY, "Snippets saved on server.");
					}, function(err) {
						console.log('Error saving the local snippets to remote');
					});
				}

			}

			dispatcher.dispatch(sniply.events.RENDER_LIST);

		};
	};

	// exports
	sniply.commands.SyncCommand = SyncCommand;

})(window.sniply = window.sniply || {});