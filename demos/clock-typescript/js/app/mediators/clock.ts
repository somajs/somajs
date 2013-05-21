///<reference path='../../../../../build/soma.d.ts'/>
///<reference path='../models/timer.ts'/>
///<reference path='../interfaces/ITimer.ts'/>
///<reference path='../interfaces/IClockView.ts'/>

module clock {

	export class ClockMediator {

		public currentClock:IClockView;
		public currentClockUpdateMethod:any;

		constructor(target:HTMLElement, dispatcher:soma.EventDispatcher, mediators:soma.Mediators, timer:ITimer) {

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
