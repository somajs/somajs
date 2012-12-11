var todo = window.todo || {};

(function( window ) {
	'use strict';

	todo.TodoApp = soma.Application.extend({
		init: function() {
			this.injector.mapClass( 'model', todo.Model, true );
			this.injector.mapValue( 'router', new Router().init() );
			this.createTemplate( todo.Template, document.getElementById( 'todoapp' ) );
		},

		start: function() {

		}

	});

	var app = new todo.TodoApp();

})( window );
//
//var router = new Router();
//router.init();
//router.on('on', '/', function() {
//	console.log('/');
//});
//router.on('on', '/completed', function() {
//	console.log('/completed');
//});
//router.on('on', '/active', function() {
//	console.log('/active');
//});

//var routes = {
//	'/': function() {
//		console.log('/');
//	},
//	'/completed': function() {
//		console.log('/completed');
//	},
//	'/active': function() {
//		console.log('/active');
//	}
//};
//
//var router = Router(routes);
//router.configure({html5history: true});
//router.init();