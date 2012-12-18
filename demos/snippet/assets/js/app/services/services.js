;(function(sniply, undefined) {

	// package
	sniply.services = sniply.services || {};

	// utils

	// services

	function ApiService() {
		this.url = 'http://localhost:3000'
	}
	ApiService.prototype.request = function(path, method, successCallback, errorCallback, data) {
		$.ajax({
			type: method,
			url: this.url + path,
			data: data,
			dataType: 'json',
			success: successCallback,
			error: errorCallback
		});
	};
	ApiService.prototype.getOauthUser = function(id, successCallback, errorCallback) {
		this.request('/oauth/' + id, 'GET', successCallback, errorCallback);
	};
	ApiService.prototype.getUser = function(id, successCallback, errorCallback) {
		this.request('/users/' + id, 'GET', successCallback, errorCallback);
	};
	ApiService.prototype.addSnippets = function(id, snippets, successCallback, errorCallback) {
		this.request('/snippets', 'POST', successCallback, errorCallback, {id:id, snippets:JSON.stringify(snippets)});
	};
	ApiService.prototype.deleteSnippet = function(id, successCallback, errorCallback) {
		this.request('/snippets/' + id, 'POST', successCallback, errorCallback, {action:'delete'});
	};

	function GithubService(token) {
		this.token = token;
		this.url = 'https://api.github.com';
	}
	GithubService.prototype.request = function(path, method, successCallback, errorCallback, data) {
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
		console.log('GET USER', this, successCallback, errorCallback);
		this.request('/user', 'GET', successCallback, errorCallback);
	};

	// exports
	sniply.services.GithubService = GithubService;
	sniply.services.ApiService = ApiService;

})(sniply = window.sniply || {});