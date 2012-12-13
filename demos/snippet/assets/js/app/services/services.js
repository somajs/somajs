;(function(snippet, undefined) {

	// package
	snippet.services = snippet.services || {};

	// utils

	// services

	function ApiService() {
		this.url = 'http://localhost:3000'
	}
	ApiService.prototype.get = function(path, method, successCallback, errorCallback, data) {
		console.log('REQUEST', this.url + path, method, data);
		$.ajax({
			type: method,
			url: this.url + path,
			data: data,
			dataType: 'json',
			success: successCallback,
			error: errorCallback
		});
	};
	ApiService.prototype.getUser = function(id, successCallback, errorCallback) {
		this.get('/users/' + id, 'GET', successCallback, errorCallback);
	};
	ApiService.prototype.addUser = function(id, successCallback, errorCallback) {
		this.get('/users', 'POST', successCallback, errorCallback, {id:id});
	};

	function GithubService(token) {
		this.token = token;
		this.url = 'https://api.github.com';
	}
	GithubService.prototype.get = function(path, method, successCallback, errorCallback, data) {
		$.ajax({
			type: method,
			url: this.url + path + '?access_token=' + this.token,
			data: data,
			dataType: 'json',
			success: successCallback,
			error: errorCallback
		});
	};
	GithubService.prototype.getUser = function(successCallback, errorCallback) {
		this.get('/user', 'GET', successCallback, errorCallback);
	};

	// exports
	snippet.services.GithubService = GithubService;
	snippet.services.ApiService = ApiService;

})(snippet = window.snippet || {});