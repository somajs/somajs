///<reference path='../vo/time.ts'/>

module clock {

	export class TimerModel {

		public callbacks:any[] = null;
		public time:TimeVO = null;

		constructor() {

			this.callbacks = [];
			this.time = new TimeVO();

			var i:number;
			var l:number;

			setInterval(function () {
				this.update();
				i = 0;
				l = this.callbacks.length;
				for (; i < l; i++) {
					this.callbacks[i](this.time);
				}
			}.bind(this), 1000);

			this.update();
		}

		update() {
			this.time.now = new Date();
			this.time.hours = this.time.now.getHours();
			this.time.minutes = this.time.now.getMinutes();
			this.time.seconds = this.time.now.getSeconds();
			this.time.milliseconds = this.time.now.getMilliseconds();
			this.time.day = this.time.now.getDay() + 1;
			this.time.date = this.time.now.getDate();
			this.time.month = this.time.now.getMonth() + 1;
		}

		add(callback:any) {
			this.callbacks.push(callback);
		}

		remove(callback:any) {
			this.callbacks.splice(this.callbacks.indexOf(callback), 1);
		}

	}

}
