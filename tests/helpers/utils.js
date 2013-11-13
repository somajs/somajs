;(function(utils, undefined) {


	utils.ie = (function () {

		if (typeof document !== 'undefined') {
			var el = document.createElement('div');
			if (typeof el.style.msTouchAction !== 'undefined') {
				return 10;
			}
		}

		var undef,
			v = 3,
			div = document.createElement('div'),
			all = div.getElementsByTagName('i');

		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
				all[0]
			);

		return v > 4 ? v : undef;

	}());


})(this['utils'] = this['utils'] || {});