;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.models = sniply.models || {};

	var UserModel = function (injector, dispatcher, api, queue, utils, config) {

		var storeKey = config.storeKey.user,
			url = config.oauthCallback,
			user = getStore(),
			popup;

		if (user) {
			dispatcher.dispatch(sniply.events.NOTIFY, "Welcome back " + user.github.name + '.');
		}

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
			if (!user || !navigator.onLine) {
				return;
			}
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
				var id = utils.uuid();
				popup = window.open(url + '?uuid=' + id, 'SignIn', 'width=985,height=685,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
				popup.onunload = function () {
					queue.add(api, 'getOauthUser', [id], function(data) {
						if (data.error) console.log('Error getting the current user', data);
						else {
							setUser(data);
							dispatcher.dispatch(sniply.events.RENDER_NAV);
							dispatcher.dispatch(sniply.events.NOTIFY, "User logged in. Welcome " + data.github.name + '.');
						}
					}, function(err) {
						console.log('Error getting the current user', err);
					});
				};
			},
			getAccessToken: function() {
				if (!user) {
					return undefined;
				}
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
		};
	};

	// exports
	sniply.models.UserModel = UserModel;

})(window.sniply = window.sniply || {});
