var todo = window.todo || {};

(function( window ) {
	'use strict';

	var ENTER_KEY = 13;

	todo.Template = function( scope, template, model, router ) {

		var todos = scope.todos = model.get();

		router.on(/.*/, function(path) {
			render();
		});

		var render = function() {

			scope.active = getActiveItems( scope.todos );
			scope.completed = scope.todos.length - scope.active;
			scope.allCompleted = scope.todos.length > 0 && scope.active === 0 ? true : false;
			scope.clearCompletedVisible = scope.completed > 0 ? true : false;
			//scope.footerVisible = scope.todos.length > 0 ? true : false;
			scope.itemLabel = scope.active === 1 ? 'item' : 'items';

			template.render();

			model.set( todos );

		}.bind( this );

		scope.filteredTodos = function() {
			var filter = router.getRoute()[0];
			if (filter === '') {
				return todos;
			}
			return todos.filter(function( todo ) {
				return filter === 'active' ? !todo.completed : todo.completed;
			});
		};

		scope.completedClass = function( completed ) {
			return completed ? 'completed' : '';
		};

		scope.add = function( event ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY && value !== '' ) {
				todos.push({
					title: value,
					completed: false
				});
				render();
				event.currentTarget.value = '';
			}
		};

		scope.remove = function( event, todo ) {
			if ( todo ) {
				todos.splice( todos.indexOf( todo ), 1 );
				render();
			}
		};

		scope.toggle = function( event, todo ) {
			todo.completed = !todo.completed;
			render();
		};

		scope.edit = function( event, todo ) {
			todo.editing = "editing";
			render();
		};

		scope.update = function( event, todo ) {
			var value = event.currentTarget.value.trim();
			if ( event.which === ENTER_KEY ) {
				if ( value ) {
					todo.title = value;
				}
				else {
					todos.splice(todos.indexOf(todo), 1);
				}
				todo.editing = "";
				render();
			}
		};

		scope.toggleAll = function( event ) {
			todos.forEach(function( todo ) {
				todo.completed = event.currentTarget.checked;
			});
			render();
		};

		scope.clearCompleted = function() {
			todos = scope.todos = todos.filter(function( todo ) {
				return !todo.completed;
			});
			render();
		};

		scope.clear = function( event ) {
			event.currentTarget.value = '';
		};

		function getActiveItems( data ) {
			return todos.filter(function( todo ) {
				return !todo.completed;
			}).length;
		}

		render();

	};

})( window );
