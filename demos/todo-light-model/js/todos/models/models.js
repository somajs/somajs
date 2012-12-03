var todo = window.todo || {};

(function( window ) {
	'use strict';

	todo.Model = function() {
		var storeKey = 'todos-somajs';
		return {
			get: function() {
				return JSON.parse( localStorage.getItem( storeKey) || '[]' );
			},
			set: function( items ) {
				console.log('set', items);
				localStorage.setItem( storeKey, JSON.stringify( items ) );
			}
		}
	};

})( window );
