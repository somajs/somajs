var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.TodoApp = soma.Application.extend({

		init: function() {

			this.injector.mapClass('model', todo.Model, true);

			this.commands.add( todo.events.ADD, todo.TodoCommand );
			this.commands.add( todo.events.REMOVE, todo.TodoCommand );
			this.commands.add( todo.events.UPDATE, todo.TodoCommand );
			this.commands.add( todo.events.TOGGLE, todo.TodoCommand );
			this.commands.add( todo.events.TOGGLE_ALL, todo.TodoCommand );
			this.commands.add( todo.events.CLEAR_COMPLETED, todo.TodoCommand );
			this.commands.add( todo.events.RENDER, todo.TodoCommand );

			this.createTemplate( todo.Template, document.getElementById( 'todoapp' ) );

		},

		start: function() {

			var model = this.injector.getValue( 'model' );
			this.dispatcher.dispatch( todo.events.RENDER, model.data );

		}

	});

	var app = new todo.TodoApp();

})( window );
