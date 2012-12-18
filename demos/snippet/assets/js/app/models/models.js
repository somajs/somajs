;(function(sniply, undefined) {

	// package
	sniply.models = sniply.models || {};

	// utils
	var uuid = function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
	function getParam(url, key) {
		if (!url) return undefined;
		var params = url.split("?")[1].split("&");
		var list = {};
		for (var i = 0, l = params.length; i < l; i++) {
			var parts = params[i].split('=');
			list[parts[0]] = parts[1];
		}
		return list[key];
	}

	// models

	function UserModel(injector, dispatcher, api, queue) {

		var storeKey = 'sniply-user',
			url = 'http://localhost:3000/oauth/client',
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
			user = value || undefined;
			setStore();
			dispatcher.dispatch('sync');
		}

		function getUserFromAPI() {
			if (!user) return;
			queue.add(api, 'getUser', [user._id], function(data) {
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
							dispatcher.dispatch('render-nav');
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
				return user !== undefined;
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

	function SnippetModel(injector, dispatcher, api, queue) {

		var storeKey = 'sniply-data';
		var data = amplify.store(storeKey) || [];

		return {
			add: function(value) {
				data.push({
					_id: uuid(),
					text: value
				});
				this.set(data);
			},
			del: function(snippet) {
				var id = snippet._id;
				data.splice(data.indexOf(snippet), 1);
				this.set(data);
				// remote
				queue.add(api, 'deleteSnippet', [id], function(data) {
					injector.getValue('userModel').updateUserApiSnippets(data);
					dispatcher.dispatch('render-list');
				}, function(err) {
					console.log('API Error deleting a snippet', err);
				});
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
