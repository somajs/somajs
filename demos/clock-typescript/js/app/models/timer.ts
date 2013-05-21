///<reference path='../vo/time.ts'/>
///<reference path='../interfaces/ITimer.ts'/>

module clock {

	export class TimerModel implements ITimer {

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

		public update():void {
			this.time.now = new Date();
			this.time.hours = this.time.now.getHours();
			this.time.minutes = this.time.now.getMinutes();
			this.time.seconds = this.time.now.getSeconds();
			this.time.milliseconds = this.time.now.getMilliseconds();
			this.time.day = this.time.now.getDay() + 1;
			this.time.date = this.time.now.getDate();
			this.time.month = this.time.now.getMonth() + 1;
		}

		public add(callback:any):void {
			this.callbacks.push(callback);
		}

		public remove(callback:any):void {
			this.callbacks.splice(this.callbacks.indexOf(callback), 1);
		}

	}

}
