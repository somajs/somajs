;(function(sniply, undefined) {

	// package
	sniply.models = sniply.models || {};

	// utils
	var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}

	// models

	function UserModel(injector, dispatcher, api, queue) {

		var storeKey = 'sniply-user',
			url = 'http://sniply.eu01.aws.af.cm/oauth/client',
			user = getStore(),
			popup;

		getUserFromAPI();

		function setStore() {
			amplify.store(storeKey, user || null);
		}

		function getStore() {
			return amplify.store(storeKey);
		}

		function setUser(value) {
			user = value;
			setStore();
			dispatcher.dispatch(sniply.events.SYNC);
		}

		function getUserFromAPI() {
			if (!user) return;
			queue.add(api, 'getUser', [user.accessToken, user._id], function(data) {
				setUser(data);
			}, function(err) {
				console.log('Error getting the user', err);
			});
		}

		return {
			signin: function(callback) {
				if (popup)  {
					popup.close();
					popup = null;
				}
				var id = uuid();
				popup = window.open(url + '?uuid=' + id, 'SignIn', 'width=985,height=685,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
				popup.onunload = function () {
					queue.add(api, 'getOauthUser', [id], function(data) {
						if (data.error) console.log('Error getting the current user', data);
						else {
							setUser(data);
							dispatcher.dispatch(sniply.events.RENDER_NAV);
						}
					}, function(err) {
						console.log('Error getting the current user', err);
					});
				}
			},
			getAccessToken: function() {
				if (!user) return undefined;
				return user.accessToken;
			},
			getUser: function() {
				return user;
			},
			isSignedIn: function() {
				return user !== undefined && user !== null;
			},
			updateUserApiSnippets: function(value) {
				user.snippets = value;
				setStore();
			},
			clear: function() {
				setUser(null);
			}
		}
	}

	function SnippetModel(injector, dispatcher, api, queue, userModel) {

		var storeKey = 'sniply-data';
		var data = amplify.store(storeKey) || [];

		return {
			add: function(value) {
				data.push({
					_id: uuid(),
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
		}
	}

	// exports
	sniply.models.UserModel = UserModel;
	sniply.models.SnippetModel = SnippetModel;

})(sniply = window.sniply || {});
