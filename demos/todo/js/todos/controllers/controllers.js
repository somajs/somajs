var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.events = {
		'ADD': 'add',
		'RENDER': 'render',
		'REMOVE': 'remove',
		'UPDATE': 'update',
		'TOGGLE': 'toggle',
		'TOGGLE_ALL': 'toggle_all',
		'CLEAR_COMPLETED': 'clear_completed'
	};

	todo.TodoCommand = function( event, model ) {
		this.execute = function( event ) {
			switch( event.type ) {
				case todo.events.ADD:
					model.addItem( event.params );
					break;
				case todo.events.REMOVE:
					model.removeItem( event.params );
					break;
				case todo.events.UPDATE:
					model.updateItem( event.params.id, event.params.title );
					break;
				case todo.events.TOGGLE:
					model.toggleItem( event.params );
					break;
				case todo.events.TOGGLE_ALL:
					model.toggleAll( event.params );
					break;
				case todo.events.CLEAR_COMPLETED:
					model.clearCompleted();
					break;
			}
		};
	};

})( window );
