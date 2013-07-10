(function(global) {

	var OAuthModel = function() {
		this.dispatcher = null;
		this.gapi = null;
		this.oauthResult = null;
		this.signedIn = false;
		this.ajax = null;
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
		this.gapi = global.gapi;
		this.oauthResult = data;
		if (data['access_token']) {
			this.dispatcher.dispatch('authenticate', true);
			this.signedIn = true;
		}
		else if (data['error']) {
			this.dispatcher.dispatch('authenticate', false);
			this.signedIn = false;
		}
	};

	OAuthModel.prototype.getToken = function() {
		if (this.gapi && this.signedIn) {
			return this.gapi.auth.getToken().access_token;
		}
	};

	OAuthModel.prototype.signout = function() {
		console.log('signout', this.getToken());
		this.ajax({
			type: 'GET',
			url: 'https://accounts.google.com/o/oauth2/revoke?token=' + this.getToken(),
			contentType: 'application/json',
			dataType: 'jsonp',
			success: success.bind(this),
			error: error.bind(this)
		});

		function error(err) {
			console.log(err);
		}

		function success(result) {
			console.log(result);
			this.signedIn = false;
			this.dispatcher.dispatch('authenticate', false);

		}
	};

	// exports
	global.gp = global.gp || {};
	global.gp.OAuthModel = OAuthModel;

})(this);
