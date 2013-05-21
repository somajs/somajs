///<reference path='face.ts'/>
///<reference path='needle-hours.ts'/>
///<reference path='needle-minutes.ts'/>
///<reference path='needle-seconds.ts'/>
///<reference path='../../../vo/time.ts'/>

module clock {

	export class AnalogView {

		private element:HTMLElement = null;

		private faceView:FaceView;
		private needleHoursView:NeedleHours;
		private needleMinutesView:NeedleMinutes;
		private needleSecondsView:NeedleSeconds;

		private radius:number = 0;
		private canvas:HTMLCanvasElement = null;
		private context:CanvasRenderingContext2D = null;

		constructor(target:HTMLElement, face:FaceView, needleSeconds:NeedleSeconds, needleMinutes:NeedleMinutes, needleHours:NeedleHours) {

			this.element = target;
			this.faceView = face;
			this.needleHoursView = needleHours;
			this.needleMinutesView = needleMinutes;
			this.needleSecondsView = needleSeconds;

			this.radius = 250;
			this.canvas = <HTMLCanvasElement>document.createElement('canvas');
			this.context = this.canvas.getContext('2d');

			this.canvas.width = this.radius;
			this.canvas.height = this.radius;
			this.element.appendChild(this.canvas);

			this.faceView.initialize(this.radius);
			this.needleSecondsView.initialize(this.radius);
			this.needleMinutesView.initialize(this.radius);
			this.needleHoursView.initialize(this.radius);

		}

		public update(time:TimeVO):void {
			this.faceView.draw(this.context);
			this.needleSecondsView.update(time.seconds);
			this.needleSecondsView.draw(this.context);
			this.needleMinutesView.update(time.minutes, time.seconds);
			this.needleMinutesView.draw(this.context);
			this.needleHoursView.update(time.hours, time.minutes, time.seconds);
			this.needleHoursView.draw(this.context);
		}

		public dispose():void {
			this.element.removeChild(this.element.firstChild);
		}

	}

}
