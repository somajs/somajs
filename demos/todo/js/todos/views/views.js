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
			scope.allCompleted = scope.todos.length > 0 && scope.active == 0 ? true : false;
			scope.clearCompletedVisible = scope.completed > 0 ? true : false;
			scope.footerVisible = scope.todos.length > 0 ? true : false;
			scope.itemLabel = scope.active === 1 ? 'item' : 'items';

			// render template
			template.render();

			// update template links
			soma.interact.parse(template.element, this);

		}.bind( this ));

		scope.completedClass = function( completed ) {
			return completed ? 'completed' : '';
		};

		function getActiveItems(data) {
			var i,
				count = 0;

			for ( i = 0; i < data.length; i++ ) {
				if ( !data[ i ].completed ) {
					count++;
				}
			}

			return count;
		};

		function getLi( element ) {
			return element && element.tagName === 'LI' ? element : getLi( element.parentNode );
		};

		function getLiId( element ) {
			return getLi( element ).getAttribute( 'data-id' );
		};

		this.add = function( event ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY && value !== '' ) {
				dispatcher.dispatch( todo.events.ADD, value );
				event.currentTarget.value = '';
			}
		};

		this.edit = function( event ) {
			getLi( event.currentTarget ).classList.add( 'editing' );
		};

		this.update = function( event ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY ) {
				var id = getLiId( event.currentTarget );
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

		this.remove = function( event, id ) {
			dispatcher.dispatch( todo.events.REMOVE, getLiId( event.currentTarget ) );
		};

		this.toggle = function(event) {
			dispatcher.dispatch( todo.events.TOGGLE, getLiId(event.currentTarget) );
		};

		this.toggleAll = function(event) {
			dispatcher.dispatch( todo.events.TOGGLE_ALL, event.currentTarget.checked );
		};

		this.clearCompleted = function() {
			dispatcher.dispatch( todo.events.CLEAR_COMPLETED );
		};

		this.clear = function(event) {
			event.currentTarget.value = '';
		};

	};

})( window );
