(function(global) {

	var OAuthModel = function() {

	};

	OAuthModel.prototype.initialize = function() {

		(function() {
			var po = document.createElement('script');
			po.type = 'text/javascript'; po.async = true;
			po.src = 'https://plus.google.com/js/client:plusone.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(po, s);
		})();

	};

	OAuthModel.prototype.signin = function(data) {
		console.log(data);
		if (data['access_token']) {
			console.log('I\'m in');
		}
		else if (data['error']) {
			console.log('Not in yet!');
		}
	};

	// exports
	global.gp = global.gp || {};
	global.gp.OAuthModel = OAuthModel;

})(this);
