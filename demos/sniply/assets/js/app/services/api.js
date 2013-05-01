;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.services = sniply.services || {};

	var ApiService = function(config) {
		this.url = config.apiUrl;
	};

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
		this.request('/snippets' + '?accessToken=' + accessToken, 'POST', successCallback, errorCallback, {id:id, action:'update', snippets:JSON.stringify(snippets)});
	};

	ApiService.prototype.deleteSnippets = function(accessToken, id, snippets, successCallback, errorCallback) {
		this.request('/snippets' + '?accessToken=' + accessToken, 'POST', successCallback, errorCallback, {id:id, action:'delete', snippets:JSON.stringify(snippets)});
	};

	// exports
	sniply.services.ApiService = ApiService;

})(window.sniply = window.sniply || {});