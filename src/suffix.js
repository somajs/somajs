
	// register for AMD module
	if (typeof define === 'function' && define.amd) {
		define("soma", soma);
	}

	// export for node.js
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = soma;
		}
		exports = soma;
	}

})(this['soma'] = this['soma'] || {}, this['infuse']);