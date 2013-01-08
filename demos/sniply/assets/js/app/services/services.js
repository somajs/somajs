;(function(sniply, undefined) {

	// package
	sniply.services = sniply.services || {};

	// utils

	// services

	function ApiService() {
		this.url = window.location.host === 'localhost' ? 'http://localhost:3000' : 'http://sniply.eu01.aws.af.cm';
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
	ApiService.prototype.getUser = function(accessToken, id, successCallback, errorCallback) {
		this.request('/users/' + id + '?accessToken=' + accessToken, 'GET', successCallback, errorCallback);
	};
	ApiService.prototype.addSnippets = function(accessToken, id, snippets, successCallback, errorCallback) {
		this.request('/snippets' + '?accessToken=' + accessToken, 'POST', successCallback, errorCallback, {id:id, snippets:JSON.stringify(snippets)});
	};
	ApiService.prototype.deleteSnippet = function(accessToken, id, successCallback, errorCallback) {
		this.request('/snippets/' + id + '?accessToken=' + accessToken, 'POST', successCallback, errorCallback, {action:'delete'});
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