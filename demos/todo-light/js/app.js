var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.TodoApp = soma.Application.extend({

		init: function() {
			this.injector.mapClass( 'model', todo.Model, true );
			this.createTemplate( todo.Template, document.getElementById( 'todoapp' ) );
		}

	});

	var app = new todo.TodoApp();

})( window );
