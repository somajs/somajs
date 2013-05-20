module snake {
	export class Snake {

		public currentPath:any[] = null;
		public width:number = 0;
		public height:number = 0;
		public rgba:string = null;

		constructor() {
			this.currentPath = [];
			this.rgba = 'rgba(46, 119, 58, 0.8)';
		}

		public draw(context) {
			context.save();
			for (var i = 0, l = this.currentPath.length; i<l; i++) {
				context.fillStyle = this.rgba;
				context.fillRect(this.currentPath[i].x, this.currentPath[i].y, this.width, this.height);
			}
			context.restore();
		}

	}
}