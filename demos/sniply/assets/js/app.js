;(function(sniply, undefined) {

	sniply.events = {
		'SELECT_NAV': 'select-nav',
		'RENDER_NAV': 'render-nav',
		'RENDER_LIST': 'render-list',
		'SYNC': 'sync',
		'LOGOUT': 'logout',
		'ADD_SNIPPET': 'add',
		'EDIT_SNIPPET': 'edit'
	};

    var App = soma.Application.extend({

	    init: function() {

		    // utils
		    this.injector.mapClass('queue', sniply.utils.Queue, true);

		    // commands
			this.commands.add('sync', sniply.commands.SyncCommand);
			this.commands.add('logout', sniply.commands.LogoutCommand);

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

})(sniply = window.sniply || {});