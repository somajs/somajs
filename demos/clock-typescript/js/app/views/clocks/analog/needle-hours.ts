///<reference path='../../../interfaces/IAnalogNeedle.ts'/>

module clock {

	export class NeedleHours implements IAnalogNeedle {

		public seconds:number = 0;
		public minutes:number = 0;
		public hours:number = 0;
		public radius:number = 0;
		public center:number = 0;
		public size:number = 0;

		public initialize(radius):void {
			this.radius = radius;
			this.center = this.radius / 2;
			this.size = this.center * 0.4;
		}

		public update(time:TimeVO):void {
			this.hours = time.hours;
			this.minutes = time.minutes;
			this.seconds = time.seconds;
		}

		public draw(context:CanvasRenderingContext2D):void {
			var theta = (30 * Math.PI / 180);
			var x = this.center + this.size * Math.cos(((this.hours + this.minutes / 60 + this.seconds / 3600) * theta) - Math.PI / 2);
			var y = this.center + this.size * Math.sin(((this.hours + this.minutes / 60 + this.seconds / 3600) * theta) - Math.PI / 2);
			context.save();
			context.lineWidth = 5;
			context.strokeStyle = '#015666';
			context.lineJoin = 'round';
			context.lineCap = 'round';
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(this.center, this.center);
			context.closePath();
			context.stroke();
			context.restore();
		}

		public dispose():void {

		}

	}

}
