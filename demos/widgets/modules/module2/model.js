(function(global) {

	var Model2 = function() {

		this.data = {
			text: 'I\'m the module 2'
		}

	};

	// exports require.js
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define(function() {
			return Model2;
		});
	}

	// export browser
	global.widgets = global.widgets || {};
	global.widgets.Model2 = Model2;

})(this);
