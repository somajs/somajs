///<reference path='face.ts'/>
///<reference path='../../../vo/time.ts'/>
///<reference path='../../../interfaces/IClockView.ts'/>
///<reference path='../../../interfaces/IAnalogNeedle.ts'/>

module clock {

	export class AnalogView implements IClockView {

		private element:HTMLElement = null;

		private faceView:FaceView;
		private needleHoursView:IAnalogNeedle;
		private needleMinutesView:IAnalogNeedle;
		private needleSecondsView:IAnalogNeedle;

		private radius:number = 0;
		private canvas:HTMLCanvasElement = null;
		private context:CanvasRenderingContext2D = null;

		constructor(target:HTMLElement, face:FaceView, needleSeconds:IAnalogNeedle, needleMinutes:IAnalogNeedle, needleHours:IAnalogNeedle) {

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
			this.needleSecondsView.update(time);
			this.needleSecondsView.draw(this.context);
			this.needleMinutesView.update(time);
			this.needleMinutesView.draw(this.context);
			this.needleHoursView.update(time);
			this.needleHoursView.draw(this.context);
		}

		public dispose():void {
			this.element.removeChild(this.element.firstChild);
		}

	}

}
