;(function(sniply, undefined) {

	// package
	sniply.utils = sniply.utils || {};

	// queue
	function Queue() {
		this.requests = [];
		this.current = null;
		this.running = false;
		this.autorun = true;
	}
	Queue.prototype = {
		add: function(target, method, params, successCallback, errorCallback) {
			this.requests.push({
				target: target,
				method: method,
				params: params,
				successCallback: successCallback,
				errorCallback: errorCallback
			});
			console.log(this.requests);
			if (this.autorun) {
				console.log('run');
				this.run();
			}
			return this;
		},
		remove: function(target, method, params, successCallback, errorCallback) {
			for (var i = this.requests.length-1, l = 0; i >= l; i--) {
				var request = this.requests[i];
				if (equals({
					target: target,
					method: method,
					params: params,
					successCallback: successCallback,
					errorCallback: errorCallback
				}), request) {
					this.request.splice(i, 1);
				}
			}
			return this;
		},
		run: function() {
			if (this.requests.length === 0 || this.current) return;
			this.current = this.requests[0];
			var params = this.current.params;
			params.push(function() {
				console.log('success');
				this.current.successCallback.apply(null, arguments);
				this.requests.shift();
				this.current = null;
				this.run();
			}.bind(this));
			params.push(function() {
				console.log('error');
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

})(sniply = window.sniply || {});