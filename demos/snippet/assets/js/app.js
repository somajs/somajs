;(function(snippet, undefined) {

    var App = soma.Application.extend({

	    init: function() {

		    // models
		    this.injector.mapClass('snippetModel', snippet.models.SnippetModel, true);
		    this.injector.mapClass('userModel', snippet.models.UserModel, true);
		    this.injector.mapClass('github', snippet.services.GithubService);

		    // views
		    this.createTemplate(snippet.views.Header, $('.header')[0]);
		    this.createTemplate(snippet.views.List, $('.list')[0]);
		    this.createTemplate(snippet.views.Manage, $('.manage')[0]);

	    }

    });

	var app = new App();

})(snippet = window.snippet || {});