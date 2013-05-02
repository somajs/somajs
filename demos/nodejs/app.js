var soma = require('soma.js'),
	template = require('soma-template'),
	Server = require('./app/models/server'),
	PageTemplate = require('./app/views/template'),
	ContentModel = require('./app/models/content'),
	ServerCommand = require('./app/commands/server');

// register soma-template to soma.js
soma.plugins.add(template.Plugin);

var MyApplication = soma.Application.extend({
	init: function() {
		// mapping rules
		this.injector.mapValue('rootDir', __dirname);
		this.injector.mapValue('PageTemplate', PageTemplate);
		this.injector.mapClass('server', Server, true);
		this.injector.mapClass('model', ContentModel, true);
		// commands
		this.commands.add('start-server', ServerCommand);
	},
	start: function() {
		// start server
		this.dispatcher.dispatch("start-server");
	}
});

var app = new MyApplication();
