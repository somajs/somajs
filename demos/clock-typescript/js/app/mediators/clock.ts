///<reference path='../../../../../build/soma.d.ts'/>
///<reference path='../models/timer.ts'/>

module clock {

	export class ClockMediator {

		public currentClock:any;
		public currentClockUpdateMethod:any;

		constructor(target:any, dispatcher:soma.EventDispatcher, mediators:soma.Mediators, timer:TimerModel) {

			dispatcher.addEventListener('create', function (event) {

				// destroy previous clock
				if (this.currentClock) {
					timer.remove(this.currentClock.update);
					this.currentClock.dispose();
				}

				// create clock
				this.currentClock = mediators.create(event.params, target);
				this.currentClockUpdateMethod = this.currentClock.update.bind(this.currentClock);

				// register clock with timer model
				timer.add(this.currentClockUpdateMethod);
				this.currentClock.update(timer.time);

			});

		}

	}

}
