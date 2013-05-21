///<reference path='../../../../../build/soma.d.ts'/>

module clock {

	export class SelectorView {

		constructor(scope:any, dispatcher:soma.EventDispatcher) {
			scope.select = function (event, id) {
				dispatcher.dispatch('create', clock[id]);
			}.bind(this);
		}


	}

}
