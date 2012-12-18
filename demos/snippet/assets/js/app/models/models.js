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

		var storeKey = 'sniply-user';
		var url = 'http://localhost:3000/oauth/client';
		var popup, popup_interval;
		var user = getStore();

		getUserFromAPI();

		function setStore() {
			amplify.store(storeKey, user || null);
		}

		function getStore() {
			return amplify.store(storeKey);
		}

		function setUser(value) {
			user = value || undefined;
			console.log('set user', user);
			setStore();
			dispatcher.dispatch('sync');

			console.log('check', getStore(storeKey));
		}

		function getUserFromAPI() {
			if (!user) return;
			queue.add(api, 'getUser', [user._id], function(data) {
				console.log(JSON.stringify(data));
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
					console.log('get oauth user');
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
//				popup_interval = setInterval(function() {
//					if (popup.location) {
//						console.log(popup.location.href);
//						if (popup.token !== undefined) {
////							console.log('CLOSED');
////							clear();
//
////							if (popup.token !== '') {
////								setToken(popup.token);
////								getUserInfo();
////							}
////							clear();
//						}
//					}
//					else {
//						//clear();
//					}
//				}, 500);
//				function clear() {
//					clearInterval(popup_interval);
//					if (popup) popup.close();
//					popup = null;
//				}
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

	function SnippetModel() {

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
