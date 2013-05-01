;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.models = sniply.models || {};

	var SnippetModel = function (injector, dispatcher, utils, config) {

		var storeKey = config.storeKey.snippet;
		var data = amplify.store(storeKey) || [];

		return {
			add: function(value) {
				data.push({
					_id: utils.uuid(),
					text: value,
					creationDate: new Date().getTime(),
					modificationDate: new Date().getTime(),
					added: true
				});
				this.set(data);
			},
			update: function(snippet, value) {
				data.forEach(function(sn, index) {
					if (sn._id === snippet._id && sn.text !== value) {
						sn.text = value;
						sn.modificationDate = new Date().getTime();
						sn.added = true;
					}
				});
				this.set(data);
			},
			del: function(snippet) {
				var id = snippet._id;
				var snippetIndex = data.indexOf(snippet);
				if (snippetIndex !== -1) {
					data[snippetIndex].deleted = true;
				}
				this.set(data);
			},
			clearDeleted: function(deletedSnippets) {
				deletedSnippets.forEach(function(snippet, index) {
					data.splice(data.indexOf(snippet), 1);
				});
				this.set(data);
			},
			clearAdded: function(addedSnippets) {
				addedSnippets.forEach(function(snippet, index) {
					var snippetIndex = data.indexOf(snippet);
					if (snippetIndex !== -1) {
						delete data[snippetIndex].added;
					}
				});
				this.set(data);
			},
			get: function() {
				return data;
			},
			set: function(value) {
				data = value || [];
				amplify.store(storeKey, value);
			},
			clear: function() {
				this.set(null);
			}
		};
	};

	// exports
	sniply.models.SnippetModel = SnippetModel;

})(window.sniply = window.sniply || {});
