///<reference path='../vo/time.ts'/>

module clock {

	export interface IClockView {

		update(time:TimeVO):void;
		dispose():void;

	}

}
