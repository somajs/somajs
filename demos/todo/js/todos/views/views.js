var todo = window.todo || {};

(function( window ) {
	'use strict';

	var ENTER_KEY = 13;

	todo.Template = function(scope, template, dispatcher) {

		scope.completedClass = function(completed) {
			return completed ? 'completed' : '';
		}

		dispatcher.addEventListener( todo.events.RENDER, function(event) {
			scope.todos = event.params;
			scope.active = getActiveItems(event.params);
			scope.completed = scope.todos.length - scope.active;
			scope.footerVisible = scope.todos.length > 0 ? true : false;
			scope.itemLabel = scope.active === 1 ? 'item' : 'items';
			template.render();
			soma.interact.parse(template.element, this);
		}.bind(this));

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

		function getId(element) {
			if (element && element.tagName === 'LI' && element.getAttribute('data-id')) {
				return element.getAttribute('data-id');
			}
			else {
				return getId(element.parentNode);
			}
		};

		this.add = function(event) {
			if ( event.which === ENTER_KEY ) {
				var value = event.currentTarget.value.trim();
				dispatcher.dispatch( todo.events.ADD, value );
				event.currentTarget.value = '';
			}
		};

		this.remove = function(event, id) {
			dispatcher.dispatch( todo.events.REMOVE, getId(event.currentTarget) );
		};

		this.complete = function() {
			dispatcher.dispatch( todo.events.TOGGLE, getId(event.currentTarget) );
		};

		this.clear = function(event) {
			event.currentTarget.value = '';
		};

	}

//	todo.TodoListView = soma.View.extend({
//		template: null,
//
//		init: function() {
//			this.template = Handlebars.compile( $( '#' + this.domElement.id + '-template' ).html() );
//			$( this.domElement ).on( 'click', '.destroy', this.destroy.bind( this ) );
//			$( this.domElement ).on( 'click', '.toggle', this.toggle.bind( this ) );
//			$( this.domElement ).on( 'dblclick', 'label', this.edit );
//			$( this.domElement ).on( 'blur', '.edit', this.update.bind( this ) );
//			$( this.domElement ).on( 'keypress', '.edit', this.blurInput );
//			$('#toggle-all').click( this.toggleAll );
//		},
//
//		render: function( data, activeCount ) {
//			$(this.domElement).html( this.template( data ) );
//			$('#toggle-all').prop( 'checked', !activeCount );
//			$('#main').toggle( !!data.length );
//		},
//
//		destroy: function( event ) {
//			var id = $(event.target).closest('li').attr('data-id');
//			this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.DELETE, null, id ) );
//		},
//
//		toggle: function( event ) {
//			var id = $(event.target).closest('li').attr('data-id');
//			this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.TOGGLE, null, id ) );
//		},
//
//		toggleAll: function() {
//			this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.TOGGLE_ALL, null, null, $( this ).prop('checked') ) );
//		},
//
//		edit: function( event ) {
//			$( this ).closest('li').addClass('editing').find('.edit').focus();
//		},
//
//		update: function( event ) {
//			var li = $( event.target ).closest('li').removeClass('editing'),
//				id = li.data('id'),
//				val = li.find('.edit').val().trim();
//
//			if ( val ) {
//				this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.UPDATE, val, id ) );
//			}
//			else {
//				this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.DELETE, null, id ) );
//			}
//		},
//
//		blurInput: function( event ) {
//			if ( event.which === ENTER_KEY ) {
//				event.target.blur();
//			}
//		}
//	});
//
//	todo.TodoListView.NAME = 'TodoListView';
//
//	todo.TodoInputView = soma.View.extend({
//
//		init: function() {
//			$( this.domElement ).keypress( this.keyPressHandler.bind( this ) );
//			$( this.domElement ).blur( this.blur );
//		},
//
//		keyPressHandler: function( event ) {
//			if ( event.which === ENTER_KEY ) {
//				this.createItem();
//			}
//		},
//
//		createItem: function() {
//			var value = this.domElement.value.trim();
//
//			if ( value ) {
//				this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.CREATE, value ) );
//			}
//
//			this.domElement.value = '';
//		},
//
//		blur: function( event ) {
//			if ( !this.value.trim() ) {
//				this.value = '';
//			}
//		}
//
//	});
//
//	todo.TodoInputView.NAME = 'TodoInputView';
//
//	todo.FooterView = soma.View.extend({
//		template: null,
//
//		init: function() {
//			this.template = Handlebars.compile( $( '#' + this.domElement.id + '-template' ).html() );
//			$( this.domElement ).on( 'click', '#clear-completed', this.clearCompleted.bind( this ) );
//		},
//
//		render: function( data ) {
//			$( this.domElement ).html( this.template( data ) );
//			$( this.domElement ).toggle( !!data.length );
//			$('#clear-completed').toggle( !!data.completed );
//		},
//
//		clearCompleted: function( event ) {
//			this.dispatchEvent( new todo.TodoEvent( todo.TodoEvent.CLEAR_COMPLETED ) );
//		}
//	});
//
//	todo.FooterView.NAME = 'FooterView';

})( window );
