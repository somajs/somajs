module clock {

	export class FaceView {

		public radius:number = 0;
		public center:number = 0;

		public initialize(radius:number):void {
			this.radius = radius / 2 - 5;
			this.center = radius / 2;
		}

		public draw(context:CanvasRenderingContext2D):void {
			context.save();
			context.clearRect(0, 0, this.center * 2, this.center * 2);
			context.lineWidth = 4.0;
			context.strokeStyle = '#015666';
			context.beginPath();
			context.arc(this.center, this.center, this.radius, 0, Math.PI * 2, true);
			context.closePath();
			context.stroke();
			this.drawDots(context);
			this.drawHourDots(context);
			this.drawCenter(context);
			context.restore();
		}

		public drawCenter(context:CanvasRenderingContext2D):void {
			context.fillStyle = '#015666';
			context.beginPath();
			context.arc(this.center, this.center, 5, 0, Math.PI * 2, false);
			context.closePath();
			context.fill();
		}

		public drawDots(context:CanvasRenderingContext2D):void {
			var theta = 0;
			var distance = this.radius * 0.9; // 90% from the center
			context.lineWidth = 0.5;
			context.strokeStyle = '#04859D';
			for (var i = 0; i < 60; i++) {
				theta = theta + (6 * Math.PI / 180);
				var x = this.center + distance * Math.cos(theta);
				var y = this.center + distance * Math.sin(theta);
				context.beginPath();
				context.arc(x, y, 1, 0, Math.PI * 2, true);
				context.closePath();
				context.stroke();
			}
		}

		public drawHourDots(context:CanvasRenderingContext2D):void {
			var theta = 0;
			var distance = this.radius * 0.9; // 90% from the center
			context.lineWidth = 5.0;
			context.strokeStyle = '#137';
			for (var i = 0; i < 12; i++) {
				theta = theta + (30 * Math.PI / 180);
				var x = this.center + distance * Math.cos(theta);
				var y = this.center + distance * Math.sin(theta);
				context.beginPath();
				context.arc(x, y, 1, 0, Math.PI * 2, true);
				context.closePath();
				context.stroke();
			}
		}

		public dispose():void {

		}

	}

}
