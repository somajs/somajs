
	// register for AMD module
	/* globals define:false */
	if (typeof define === 'function' && typeof define.amd !== 'undefined') {
		define('soma', soma);
	}

	// export for node.js
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = soma;
	}
	else {
		window.soma = soma;
	}

})(this['soma'] = this['soma'] || {}, this['infuse']);