;(function(sniply, undefined) {

//	'use strict';

	sniply.events = {
		'SELECT_NAV': 'select-nav',
		'RENDER_NAV': 'render-nav',
		'RENDER_LIST': 'render-list',
		'SYNC': 'sync',
		'LOGOUT': 'logout',
		'ADD_SNIPPET': 'add',
		'EDIT_SNIPPET': 'edit',
		'NOTIFY': 'notify'
	};

    var App = soma.Application.extend({

		init: function() {

			// utils
			this.injector.mapValue('config', sniply.config);
			this.injector.mapValue('utils', sniply.utils);
			this.injector.mapClass('queue', sniply.utils.Queue, true);

			// commands
			this.commands.add(sniply.events.SYNC, sniply.commands.SyncCommand);
			this.commands.add(sniply.events.LOGOUT, sniply.commands.LogoutCommand);
			this.commands.add(sniply.events.NOTIFY, sniply.commands.NotifyCommand);

			// services
			this.injector.mapClass('api', sniply.services.ApiService);

			// models
			this.injector.mapClass('snippetModel', sniply.models.SnippetModel, true);
			this.injector.mapClass('userModel', sniply.models.UserModel, true);

			// views
			this.createTemplate(sniply.views.Header, $('.header')[0]);
			this.createTemplate(sniply.views.List, $('.list')[0]);
			this.createTemplate(sniply.views.Manage, $('.manage')[0]);

		},

		start: function() {

		}

    });

	var app = new App();

})(window.sniply = window.sniply || {});