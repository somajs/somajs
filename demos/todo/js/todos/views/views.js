var todo = window.todo || {};

(function( window ) {

	'use strict';

	var ENTER_KEY = 13;

	todo.Template = function( scope, template, dispatcher ) {

		dispatcher.addEventListener( todo.events.RENDER, function( event ) {

			// update template data
			scope.todos = event.params;
			scope.active = getActiveItems( event.params );
			scope.completed = scope.todos.length - scope.active;
			scope.allCompleted = scope.todos.length > 0 && scope.active === 0 ? true : false;
			scope.clearCompletedVisible = scope.completed > 0 ? true : false;
			scope.footerVisible = scope.todos.length > 0 ? true : false;
			scope.itemLabel = scope.active === 1 ? 'item' : 'items';

			// render template
			template.render();

		}.bind( this ));

		scope.completedClass = function( completed ) {
			return completed ? 'completed' : '';
		};

		scope.add = function( event ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY && value !== '' ) {
				dispatcher.dispatch( todo.events.ADD, value );
				event.currentTarget.value = '';
			}
		};

		scope.edit = function( event, todo ) {
			getLi( event.currentTarget ).classList.add( 'editing' );
		};

		scope.update = function( event, id ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY ) {
				if ( value ) {
					dispatcher.dispatch( todo.events.UPDATE, {
						id: id,
						title: value
					});
				}
				else {
					dispatcher.dispatch( todo.events.REMOVE, id );
				}
				getLi( event.currentTarget ).classList.remove( 'editing' );
			}
		};

		scope.remove = function( event, id ) {
			dispatcher.dispatch( todo.events.REMOVE, id );
		};

		scope.toggle = function( event, id ) {
			dispatcher.dispatch( todo.events.TOGGLE, id );
		};

		scope.toggleAll = function(event) {
			dispatcher.dispatch( todo.events.TOGGLE_ALL, event.currentTarget.checked );
		};

		scope.clearCompleted = function() {
			dispatcher.dispatch( todo.events.CLEAR_COMPLETED );
		};

		scope.clear = function(event) {
			event.currentTarget.value = '';
		};

		function getActiveItems( data ) {
			return data.filter(function( todo ) {
				return !todo.completed;
			}).length;
		}

		function getLi( element ) {
			return element && element.tagName === 'LI' ? element : getLi( element.parentNode );
		}

	};

})( window );
