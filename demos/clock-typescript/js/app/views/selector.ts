///<reference path='../../../../../build/soma.d.ts'/>
///<reference path='../views/clocks/analog/analog.ts'/>
///<reference path='../views/clocks/digital/digital.ts'/>
///<reference path='../views/clocks/polar/polar.ts'/>

module clock {

	export class SelectorView {

		public views:any = {
			'digital': DigitalView,
			'analog': AnalogView,
			'polar': PolarView
		};

		constructor(scope:any, dispatcher:soma.EventDispatcher) {
			scope.select = function (event, id) {
				dispatcher.dispatch('create', this.views[id]);
			}.bind(this);
		}


	}

}
