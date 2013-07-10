(function(global) {

	var OAuthModel = function() {
		this.dispatcher = null;
		this.gapi = null;
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
		this.gapi.client.load('plus','v1', function() {
			if (data['access_token']) {
				this.signedIn = true;
				this.dispatcher.dispatch('authenticate', true);
			} else if (data['error']) {
				this.signedIn = false;
				this.dispatcher.dispatch('authenticate', false);
			}
		}.bind(this));
	};

	OAuthModel.prototype.getToken = function() {
		if (this.gapi && this.signedIn) {
			return this.gapi.auth.getToken().access_token;
		}
	};

	OAuthModel.prototype.signout = function() {
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
			this.dispatcher.dispatch('error', err);
		}

		function success() {
			this.signedIn = false;
			this.dispatcher.dispatch('authenticate', false);

		}
	};

	// exports
	global.gp = global.gp || {};
	global.gp.OAuthModel = OAuthModel;

})(this);
