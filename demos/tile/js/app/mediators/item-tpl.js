(function(global) {

	'use strict';

	var ItemPtlMediator = function(target, dispatcher, tpl, parentTemplate, parentScope, partials) {

		this.data = null;


		console.log('>>>>>>>>>>>>>', parentScope);
		console.log('>>>>>>>>>>>>>', parentTemplate);


		target.innerHTML = partials['tile-item.tpl.html'];

		var template = tpl(target.firstChild);
		var scope = template.scope;


		console.log('----------------------------------------CREATED');

//		var template = tpl(target);
//		var scope = template.scope;

//		scope.data = data;
//		template.render();
//
//		if (data) {
//			data.remove = function() {
//				console.log('REMOVE ITEM');
//	//			target.parentNode.removeChild(target);
//				dispatcher.dispatch('remove', data.id);
//			};
//		}

		scope.remove = function() {
//			target.parentNode.removeChild(target);
			console.log(this);
			dispatcher.dispatch('remove', scope.item.id);
		};

		this.postConstruct = function() {
			dispatcher.dispatch('log', 'item template mediator created, with data: ' + this.data);
			console.log('MEDIATOR DATA HAS CHANGED!!!!!!!');
			console.log(this.data);
			scope.item = this.data;
			template.render();
		};

		this.dispose = function() {
			dispatcher.dispatch('log', 'item template mediator removed, id: ' + this.data.id);
//			template.dispose();
//			template = null;
		};

	};

	// export
	global.tile = global.tile || {};
	global.tile.ItemPtlMediator = ItemPtlMediator;

})(this);
