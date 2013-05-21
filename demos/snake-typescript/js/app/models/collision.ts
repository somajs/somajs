///<reference path='../interfaces/time.ts'/>

module snake {
	export class Collision {

		constructor(snakeLayer, foodLayer, time:ITime, dispatcher) {

			time.addSpeedHandler(function() {
				if (snakeLayer.getPosition().col === foodLayer.getPosition().col && snakeLayer.getPosition().row === foodLayer.getPosition().row) {
					dispatcher.dispatch('eating');
					foodLayer.reset();
				}
			}.bind(this));

		}

	}
}