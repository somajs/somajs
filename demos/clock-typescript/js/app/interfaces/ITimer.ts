///<reference path='../vo/time.ts'/>

module clock {

	export interface ITimer {

		callbacks: any[];
		time: TimeVO;

		update():void;
		add(callback:any):void;
		remove(callback:any):void;

	}

}
