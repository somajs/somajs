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
		var current = 'list';

		dispatcher.addEventListener('render-nav', render);
		dispatcher.addEventListener('select-nav', function(event) {
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
			dispatcher.dispatch('logout');
			render();
		}
		scope.showList = function(event, id) {
			dispatcher.dispatch('select-nav', 'list');
		}
		scope.showManage = function(event, id) {
			dispatcher.dispatch('select-nav', 'manage');
			dispatcher.dispatch('add');
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

		dispatcher.addEventListener('render-list', render);

		scope.search = function(event) {
			inputValue = target(event).value;
			template.render();
		}

		scope.del = function(event, snippet) {
			snippetModel.del(snippet);
			dispatcher.dispatch('sync');
		}

		scope.edit = function(event, snippet) {
			dispatcher.dispatch('select-nav', 'manage');
			dispatcher.dispatch('edit', snippet);
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

		var textarea = $('textarea', template.element);
		var editingSnippet;

		scope.label = 'add';

		dispatcher.addEventListener('add', function(event) {
			editingSnippet = null;
			scope.label = 'add';
			template.render();
		});

		dispatcher.addEventListener('edit', function(event) {
			editingSnippet = event.params;
			textarea.val(editingSnippet.text);
			scope.label = 'update';
			template.render();
		});

		scope.update = function() {
			var value = textarea.val().trim();
			if (value === '') return;
			if (!editingSnippet) {
				snippetModel.add(textarea.val());
				dispatcher.dispatch('sync');
				dispatcher.dispatch('select-nav', 'list');
			}
			else {
				snippetModel.update(editingSnippet, textarea.val());
				dispatcher.dispatch('sync');
				dispatcher.dispatch('select-nav', 'list');
			}
			textarea.val('');
		}

		template.render();
	}

	// exports
	sniply.views.Header = Header;
	sniply.views.List = List;
	sniply.views.Manage = Manage;

})(sniply = window.sniply || {});