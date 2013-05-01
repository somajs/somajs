var todo = window.todo || {};

(function( window ) {

	'use strict';

	todo.Model = function( dispatcher ) {
		this.dispatcher = dispatcher;
		this.storeKey = 'todos-somajs';
		this.data = JSON.parse( this.getStore() ) || [];
	};

	todo.Model.prototype = {

		addItem: function( title ) {
			this.data.push({
				id: this.uuid(),
				title: title,
				completed: false
			});
			this.update();
		},

		removeItem: function( id ) {
			this.data.splice( this.getIndexById( id ), 1 );
			this.update();
		},

		toggleItem: function( id ) {
			var item = this.data[ this.getIndexById( id ) ];
			item.completed = !item.completed;
			this.update();
		},

		updateItem: function( id, title ) {
			this.data[ this.getIndexById( id ) ].title = title;
			this.update();
		},

		toggleAll: function( toggleValue ) {
			this.data.forEach(function( item ) {
				item.completed = toggleValue;
			});
			this.update();
		},

		clearCompleted: function() {
			this.data = this.data.filter(function( item ) {
				return !item.completed;
			});

			var i = this.data.length;
			while ( i-- ) {
				if ( this.data[ i ].completed ) {
					this.data.splice( i, 1 );
				}
			}
			this.update();
		},

		getIndexById: function( id ) {
			var i;
			for ( i = 0; i < this.data.length; i++ ) {
				if ( this.data[ i ].id === id ) {
					return i;
				}
			}
			return -1;
		},

		update: function() {
			this.setStore( this.data );
			this.dispatcher.dispatch( todo.events.RENDER, this.data );
		},

		getStore: function() {
			return localStorage.getItem( this.storeKey );
		},

		setStore: function() {
			localStorage.setItem( this.storeKey, JSON.stringify( this.data ) );
		},

		// https://gist.github.com/1308368
		uuid: function(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b;}
	};

})( window );
