module snake {
	export class Food {

		public x:number = 0;
		public y:number = 0;
		public width:number = 0;
		public height:number = 0;
		public rgba:string = null;

		constructor() {
			this.rgba = 'rgba(129, 45, 37, 0.8)';
		}

		public draw(context) {
			context.save();
			context.fillStyle = this.rgba;
			context.fillRect(this.x, this.y, this.width, this.height);
			context.restore();
		}

	}
}