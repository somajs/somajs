;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.views = sniply.views || {};

	// template utils
	soma.template.helpers({isOnline: navigator.onLine});

	var Header = function(template, scope, dispatcher, userModel) {

		var list = ['list', 'manage'];
		var current = list[0];

		dispatcher.addEventListener(sniply.events.RENDER_NAV, render);
		dispatcher.addEventListener(sniply.events.SELECT_NAV, function(event) {
			current = event.params;
			for (var i = 0, l = list.length; i < l; i++) {
				$('.' + list[i])[ list[i] === current ? 'removeClass' : 'addClass' ]('hidden');
				$('.nav-' + list[i])[ list[i] === current ? 'addClass' : 'removeClass' ]('hidden');
			}
		});

		scope.isSignedIn = function() {
			return userModel.isSignedIn();
		};

		scope.logout = function() {
			dispatcher.dispatch(sniply.events.LOGOUT);
			render();
		};

		scope.showList = function(event, id) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'list');
		};

		scope.showManage = function(event, id) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'manage');
			dispatcher.dispatch(sniply.events.ADD_SNIPPET);
		};

		scope.signin = function() {
			// stay in the same function to avoid popup blocker
			userModel.signin();
		};

		scope.getUserAvatar = function(user) {
			return user && navigator.onLine ? user.github.avatar_url : '';
		};

		function render() {
			scope.user = userModel.getUser();
			template.render();
		}

		render();

	};

	// exports
	sniply.views.Header = Header;

})(window.sniply = window.sniply || {});