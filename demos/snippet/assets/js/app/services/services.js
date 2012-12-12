;(function(snippet, undefined) {

	// package
	snippet.services = snippet.services || {};

	// utils

	// services

	function GithubService(token) {
		this.token = token;
		this.url = 'https://api.github.com/';
	}
	GithubService.prototype.get = function(path, successCallback, errorCallback, data) {
		$.ajax({
			type: 'GET',
			url: this.url + path + '?access_token=' + this.token,
			data: data,
			dataType: 'json',
			success: successCallback,
			error: errorCallback
		});
	};
	GithubService.prototype.getUser = function(successCallback, errorCallback) {
		this.get('user', successCallback, errorCallback);
	};

	// exports
	snippet.services.GithubService = GithubService;

})(snippet = window.snippet || {});