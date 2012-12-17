;(function(snippet, undefined) {

	// package
	snippet.models = snippet.models || {};

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

	function UserModel(injector, dispatcher) {

		var storeKey = 'snippet-user';
		var url = 'http://localhost:3000/oauth';
		var popup, popup_interval;
		var token = getStore('token');
		var user = getStore('user');

		if (token) injector.mapValue('token', token);
		if (user) injector.mapValue('user', user);

		if (token && !user) getUserInfo();

		function setStore() {
			amplify.store(storeKey, {
				token: token,
				user: user
			});
		}

		function getStore(key) {
			var data = amplify.store(storeKey);
			return !data ? data : data[key];
		}

		function setToken(value) {
			token = value;
			injector.removeMapping('token').mapValue('token', token);
			setStore();
		}

		function setUser(value) {
			user = value;
			injector.removeMapping('user').mapValue('user', user);
			setStore();
		}

		function getUserInfo() {
			var service = injector.getValue('github');
			service.getUser(function(data) {
				setUser(data);
				dispatcher.dispatch('render-nav');
			}, function(data) {
				console.log('Error getting the user', data);
			});
		}

		return {
			signin: function(callback) {
				if (popup) clear();
				popup = window.open(url, 'SignIn', 'width=985,height=685,personalbar=0,toolbar=0,scrollbars=1,resizable=1');
				popup.onunload = function () {
					console.log('CLOSED');

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
			getToken: function() {
				return token;
			},
			getUser: function() {
				return user;
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

	function SnippetModel() {

		var storeKey = 'snippet-data';
		var data = amplify.store(storeKey) || [];

		return {
			add: function(value) {
				data.push({
					id: uuid(),
					text: value
				});
				this.set(data);
			},
			get: function() {
				return data;
			},
			set: function(value) {
				amplify.store(storeKey, value);
			}
		}
	}

	// exports
	snippet.models.UserModel = UserModel;
	snippet.models.SnippetModel = SnippetModel;

})(snippet = window.snippet || {});