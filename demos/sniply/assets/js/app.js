;(function(sniply, undefined) {

    var App = soma.Application.extend({

	    init: function() {

		    // utils
		    this.injector.mapClass('queue', sniply.utils.Queue, true);

		    // commands
			this.commands.add('sync', sniply.commands.SyncCommand);
			this.commands.add('logout', sniply.commands.LogoutCommand);

		    // services
		    this.injector.mapClass('github', sniply.services.GithubService);
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
//		    this.dispatcher.dispatch('sync');

//			var service = new sniply.services.ApiService();
//		    var queue = new sniply.utils.Queue();
//		    queue.add(service, 'addUser', ['soundstep1'], function(d){console.log('1a', d);}, function(d){console.log('1b', d);})
//		    queue.add(service, 'getUser', ['soundstep1'], function(d){console.log('2a', d);}, function(d){console.log('2b', d);})
//		    queue.add(service, 'addUser', ['soundstep2'], function(d){console.log('3a', d);}, function(d){console.log('3b', d);})
//		    queue.add(service, 'getUser', ['soundstep2'], function(d){console.log('4a', d);}, function(d){console.log('4b', d);})
//		    queue.run();
	    }

    });

	var app = new App();

})(sniply = window.sniply || {});