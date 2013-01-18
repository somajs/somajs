;(function(sniply, undefined) {

	// package
	sniply.views = sniply.views || {};

	// utils
	function target(event) {
		return event.currentTarget ? event.currentTarget : event.srcElement;
	}

	// templates

	function Header(template, scope, dispatcher, userModel, api) {

		var list = ['list', 'manage'];
		var current = list[0];

		dispatcher.addEventListener(sniply.events.RENDER_NAV, render);
		dispatcher.addEventListener(sniply.events.SELECT_NAV, function(event) {
			current = event.params;
			for (var i = 0, l = list.length; i < l; i++) {
				$('.' + list[i])[ list[i] === current ? 'removeClass' : 'addClass' ]('hidden');
				$('.nav-' + list[i])[ list[i] === current ? 'addClass' : 'removeClass' ]('hidden');
			}
		});

		scope.isSignedIn = function() {
			return userModel.isSignedIn();
		}
		scope.logout = function() {
			dispatcher.dispatch(sniply.events.LOGOUT);
			render();
		}
		scope.showList = function(event, id) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'list');
		}
		scope.showManage = function(event, id) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'manage');
			dispatcher.dispatch(sniply.events.ADD_SNIPPET);
		}
		scope.signin = function() {
			// stay in the same function to avoid popup blocker
			userModel.signin();
		}

		function render() {
			scope.user = userModel.getUser();
			template.render();
		}

		render();

	}

	function List(template, scope, dispatcher, snippetModel) {

		var inputValue = '';
		var snippetFiltered = [];
		var brush = new SyntaxHighlighter.brushes.JScript();

		brush.init({toolbar:false});

		dispatcher.addEventListener(sniply.events.RENDER_LIST, render);

		scope.search = function(event) {
			inputValue = target(event).value;
			template.render();
		}

		scope.getSnippetLength = function() {
			var length = scope.snippets.filter(function(snippet, index, array) {
				return snippet.text.indexOf(inputValue) !== -1 && !snippet.deleted
			}).length;
			var plural = length > 1 ? 's' : '';
			return length + ' snippet' + plural + ' found.';
		}

		scope.clearFilterVisible = function() {
			return inputValue !== '';
		}

		scope.clearFilter = function(event) {
			inputValue = '';
			$('.filter input', template.element).val('');
			render();
		}

		scope.showHint = function(event) {
			target(event).setAttribute('placeholder', 'filter');
		}

		scope.hideHint = function(event) {
			target(event).removeAttribute('placeholder', 'filter');
		}

		scope.del = function(event, snippet) {
			snippetModel.del(snippet);
			dispatcher.dispatch(sniply.events.SYNC);
		}

		scope.edit = function(event, snippet) {
			dispatcher.dispatch(sniply.events.SELECT_NAV, 'manage');
			dispatcher.dispatch(sniply.events.EDIT_SNIPPET, snippet);
		}

		scope.isVisible = function(snippet) {
			if (!snippet) return false;
			return snippet.text.indexOf(inputValue) !== -1 && !snippet.deleted;
		}

		scope.getSnippetHtml = function(snippet) {
			return brush.getHtml(snippet.text);
		}

		function render() {
			scope.snippets = snippetModel.get();
			template.render();
		}

		render();

	}

	function Manage(template, scope, dispatcher, snippetModel) {

		var editingSnippet;
		var editor = CodeMirror($('.text-input', template.element)[0], {
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
			if (value === '') return;
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
		}

		template.render();
	}

	// exports
	sniply.views.Header = Header;
	sniply.views.List = List;
	sniply.views.Manage = Manage;

})(sniply = window.sniply || {});