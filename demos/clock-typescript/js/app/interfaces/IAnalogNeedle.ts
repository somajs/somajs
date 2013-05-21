module clock {

	export interface IAnalogNeedle {

		initialize(radius:number):void;
		update(seconds:number, minutes?:number, hours?:number):void;
		draw(context:CanvasRenderingContext2D):void;

	}

}
