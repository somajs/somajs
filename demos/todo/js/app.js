var todo = window.todo || {};

(function( window ) {
	'use strict';

	todo.events = {
		'ADD':'add',
		'RENDER':'render',
		'REMOVE':'remove',
		'TOGGLE':'toggle',
		'CLEAR_COMPLETED':'clear_completed'
	};
//	todo.TodoEvent.CREATE = 'TodoEvent.CREATE';
//	todo.TodoEvent.DELETE = 'TodoEvent.DELETE';
//	todo.TodoEvent.UPDATE = 'TodoEvent.UPDATE';
//	todo.TodoEvent.TOGGLE = 'TodoEvent.TOGGLE';
//	todo.TodoEvent.TOGGLE_ALL = 'TodoEvent.TOGGLE_ALL';
//	todo.TodoEvent.CLEAR_COMPLETED = 'TodoEvent.CLEAR_COMPLETED';

	todo.TodoApp = soma.Application.extend({

		init: function() {

			this.injector.mapClass('model', todo.Model, true);

			this.commands.add( todo.events.ADD, todo.TodoCommand );
			this.commands.add( todo.events.REMOVE, todo.TodoCommand );
			this.commands.add( todo.events.TOGGLE, todo.TodoCommand );
			this.commands.add( todo.events.CLEAR_COMPLETED, todo.TodoCommand );
			this.commands.add( todo.events.RENDER, todo.TodoCommand );

			this.createTemplate(todo.Template, document.getElementById('todoapp'));

//			this.addModel( todo.TodoModel.NAME, new todo.TodoModel() );
//
//			this.addCommand( todo.TodoEvent.RENDER, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.CREATE, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.DELETE, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.TOGGLE, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.UPDATE, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.TOGGLE_ALL, todo.TodoCommand );
//			this.addCommand( todo.TodoEvent.CLEAR_COMPLETED, todo.TodoCommand );
//
//			this.addView( todo.TodoListView.NAME, new todo.TodoListView( $('#todo-list')[0] ) );
//			this.addView( todo.FooterView.NAME, new todo.FooterView( $('#footer')[0] ) );
//			this.addView( todo.TodoInputView.NAME, new todo.TodoInputView( $('#new-todo')[0] ) );
		},

		start: function() {
			var model = this.injector.getValue('model');
			this.dispatcher.dispatch( todo.events.RENDER, model.data );
		}

	});

	var app = new todo.TodoApp();

})( window );
