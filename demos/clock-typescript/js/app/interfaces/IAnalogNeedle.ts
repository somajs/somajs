module clock {

	export interface IAnalogNeedle {

		initialize(radius:number):void;
		update(time:TimeVO):void;
		draw(context:CanvasRenderingContext2D):void;

	}

}

