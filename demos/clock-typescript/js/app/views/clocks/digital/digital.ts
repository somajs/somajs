///<reference path='../../../vo/time.ts'/>
///<reference path='../../../interfaces/IClockView.ts'/>

module clock {

	export class DigitalView implements IClockView {

		private element:HTMLElement = null;

		constructor(target:HTMLElement) {
			this.element = target;
		}

		public update(time:TimeVO):void {
			this.element.innerHTML = this.format(time.hours) + ':' + this.format(time.minutes) + ':' + this.format(time.seconds);
		}

		public format(value:number):string {
			if (value < 10) {
				return '0' + value.toString();
			}
			return value.toString();
		}

		public dispose():void {
			this.element.innerHTML = '';
		}

	}

}
