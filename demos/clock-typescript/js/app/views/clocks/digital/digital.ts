///<reference path='../../../vo/time.ts'/>

module clock {

	export class DigitalView {

		private element:HTMLElement = null;

		constructor(target:HTMLElement) {
			this.element = target;
		}

		update(time:TimeVO) {
			this.element.innerHTML = this.format(time.hours) + ':' + this.format(time.minutes) + ':' + this.format(time.seconds);
		}

		format(value:number):string {
			if (value < 10) {
				return '0' + value.toString();
			}
			return value.toString();
		}

		dispose() {
			this.element.innerHTML = '';
		}

	}

}
