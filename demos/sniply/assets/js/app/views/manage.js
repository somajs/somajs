;(function(sniply, undefined) {

	'use strict';

	// package
	sniply.views = sniply.views || {};

	var Manage = function (template, scope, dispatcher, snippetModel) {

		var editingSnippet;
		var editor = new CodeMirror($('.text-input', template.element)[0], {
			mode: "javascript",
			theme: "eclipse",
			lineNumbers: true,
			indentUnit: 4
		});

		scope.label = 'add';

		dispatcher.addEventListener(sniply.events.ADD_SNIPPET, function(event) {
			editingSnippet = null;
			editor.setValue('');
			scope.label = 'add';
			template.render();
			editor.refresh();
			editor.focus();
		});

		dispatcher.addEventListener(sniply.events.EDIT_SNIPPET, function(event) {
			editingSnippet = event.params;
			editor.setValue(editingSnippet.text);
			scope.label = 'update';
			template.render();
			editor.refresh();
			editor.focus();
		});

		scope.update = function() {
			var value = editor.getValue().trim();
			if (value === '') {
				return;
			}
			if (!editingSnippet) {
				snippetModel.add(value);
				dispatcher.dispatch(sniply.events.SYNC);
				dispatcher.dispatch(sniply.events.SELECT_NAV, 'list');
			}
			else {
				snippetModel.update(editingSnippet, value);
				dispatcher.dispatch(sniply.events.SYNC);
				dispatcher.dispatch(sniply.events.SELECT_NAV, 'list');
			}
		};

		template.render();
	};

	// exports
	sniply.views.Manage = Manage;

})(window.sniply = window.sniply || {});