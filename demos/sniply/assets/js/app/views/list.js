;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.views = sniply.views || {};

	var List = function(template, scope, dispatcher, snippetModel, utils) {

		var inputValue = '';
		var target = utils.target;
		var brush = new SyntaxHighlighter.brushes.JScript();

		brush.init({toolbar:false});

		dispatcher.addEventListener(sniply.events.RENDER_LIST, render);

		scope.search = function(event) {
			inputValue = target(event).value;
			template.render();
		};

		scope.getSnippetLength = function() {
			var length = scope.snippets.filter(function(snippet, index, array) {
				return snippet.text.indexOf(inputValue) !== -1 && !snippet.deleted
			}).length;
			var plural = length > 1 ? 's' : '';
			return length + ' snippet' + plural + ' found.';
		};

		scope.clearFilterVisible = function() {
			return inputValue !== '';
		};

		scope.clearFilter = function(event) {
			inputValue = '';
			$('.filter input', template.element).val('');
			render();
		};

		scope.showHint = function(event) {
			target(event).setAttribute('placeholder', 'filter');
		};

		scope.hideHint = function(event) {
			target(event).removeAttribute('placeholder', 'filter');
		};

		scope.del = function(event, snippet) {
			snippetModel.del(snippet);
			dispatcher.dispatch(sniply.events.SYNC);
		};

		scope.edit = function(event, snippet) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'manage');
			dispatcher.dispatch(sniply.events.EDIT_SNIPPET, snippet);
		};

		scope.isVisible = function(snippet) {
			if (!snippet) {
				return false;
			}
			return snippet.text.indexOf(inputValue) !== -1 && !snippet.deleted;
		};

		scope.getSnippetHtml = function(snippet) {
			return brush.getHtml(snippet.text);
		};

		function render() {
			scope.snippets = snippetModel.get();
			template.render();
		}

		render();

	};

	// exports
	sniply.views.List = List;

})(window.sniply = window.sniply || {});