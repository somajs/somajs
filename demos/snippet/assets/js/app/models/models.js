;(function(sniply, undefined) {

	// package
	sniply.models = sniply.models || {};

	// var stores
	var storeUser = 'sniply-user';
	var storeSnippet = 'sniply-snippet';

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

		var token = getStore('token'),
			user = getStore('user'),
			popup,
			popup_interval;

		if (token) injector.mapValue('token', token);
		if (user) injector.mapValue('user', user);

		if (token && user) {
			console.log('UPDATE USER');
			updateUser();
		}

		function setStore() {
			amplify.store(storeUser, {
				token: token,
				user: user
			});
		}

		function getStore(key) {
			var data = amplify.store(storeUser);
			return !data ? data : data[key];
		}

		function setToken(value) {
			token = value;
			setStore();
		}

		function setUser(githubUser, apiUser) {
			user = apiUser;
			user.github = githubUser;
			setStore();
			dispatcher.dispatch('sync');
			dispatcher.dispatch('render-list');
		}

		function updateUser() {
			var github = injector.getValue('github');
			queue.add(github, 'getUser', [], function(githubData) {
				// check if user exists in API
				queue.add(api, 'getUser', [githubData.login], function(result) {
					if (result.error) {
						// user doesn't exist
						queue.add(api, 'addUser', [githubData.login],function(data) {
							setUser(githubData, data);
							dispatcher.dispatch('render-nav');
						}, function(err) {
							console.log('API Error creating the user');
						});
					}
					else {
						// user exists
						setUser(githubData, result);
						dispatcher.dispatch('render-nav');
					}

				}, function(err) {
					console.log('API Error getting the user', err);
				});
			}, function(err) {
				console.log('Github Error getting the user', err);
			});
		}

		return {
			signin: function(callback) {
				if (popup) clear();
				popup = window.open('oauth', 'SignIn', 'width=985,height=685,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
				popup_interval = setInterval(function() {
					if (popup.location) {
						if (popup.token !== undefined) {
							if (popup.token !== '') {
								setToken(popup.token);
								updateUser();
							}
							clear();
						}
					}
					else {
						clear();
					}
				}, 500);
				function clear() {
					clearInterval(popup_interval);
					if (popup) popup.close();
					popup = null;
				}
			},
			getToken: function() {
				return token;
			},
			getUser: function() {
				return user;
			},
			updateUserApiSnippets: function(value) {
				if (user) {
					user.snippets = value;
					setStore();
				}
			},
			isSignedIn: function() {
				return token !== undefined && user !== undefined;
			},
			logout: function() {
				token = undefined;
				user = undefined;
				injector.removeMapping('token');
				injector.removeMapping('user');
				setStore();
			}
		}
	}

	function SnippetModel(injector, dispatcher, api, queue) {

		var data = amplify.store(storeSnippet) || [],
			isSyncing = false;

		return {
			add: function(value, id) {
				data.push({
					_id: id || uuid(),
					text: value
				});
				this.set(data);
				// sync
				dispatcher.dispatch('sync');
			},
			del: function(snippet) {
				var id = snippet._id;
				console.log(data.length);
				data.splice(data.indexOf(snippet), 1);
				console.log(data.length);
				this.set(data);
				// remote
				queue.add(api, 'deleteSnippet', [id], function(data) {
					injector.getValue('userModel').updateUserApiSnippets(data);
					//dispatcher.dispatch('sync');
				}, function(err) {
					console.log('API Error deleting a snippet', err);
				});
			},
			get: function() {
				return data;
			},
			set: function(value) {
				amplify.store(storeSnippet, value);
				data = value;
				dispatcher.dispatch('render-list');
			}
		}
	}

	// exports
	sniply.models.UserModel = UserModel;
	sniply.models.SnippetModel = SnippetModel;

})(sniply = window.sniply || {});