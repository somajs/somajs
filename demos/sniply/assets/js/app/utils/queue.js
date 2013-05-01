;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.utils = sniply.utils || {};

	var Queue = function(utils) {
		this.requests = [];
		this.current = null;
		this.running = false;
		this.autorun = true;
		this.equals = utils.equals;
	};

	Queue.prototype = {
		add: function(target, method, params, successCallback, errorCallback) {
			this.requests.push({
				target: target,
				method: method,
				params: params,
				successCallback: successCallback,
				errorCallback: errorCallback
			});
			if (this.autorun) {
				this.run();
			}
			return this;
		},
		remove: function(target, method, params, successCallback, errorCallback) {
			for (var i = this.requests.length-1, l = 0; i >= l; i--) {
				var request = this.requests[i];
				if (this.equals({
					target: target,
					method: method,
					params: params,
					successCallback: successCallback,
					errorCallback: errorCallback
				}, request)) {
					this.request.splice(i, 1);
				}
			}
			return this;
		},
		run: function() {
			if (this.requests.length === 0 || this.current) {
				return;
			}
			this.current = this.requests[0];
			var params = this.current.params;
			params.push(function() {
				this.current.successCallback.apply(null, arguments);
				this.requests.shift();
				this.current = null;
				this.run();
			}.bind(this));
			params.push(function() {
				this.current.errorCallback.apply(null, arguments);
				this.requests.shift();
				this.current = null;
				this.run();
			}.bind(this));
			if (typeof this.current.target[this.current.method] === 'function') {
				this.current.target[this.current.method].apply(this.current.target, params);
			}
			return this;
		}
	};

	// exports
	sniply.utils.Queue = Queue;

})(window.sniply = window.sniply || {});