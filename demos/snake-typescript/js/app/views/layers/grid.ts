module snake {
	export class GridLayer {

		private context:any = null;
		private time:any = null;
		private grid:any = null;
		private debug:any = null;

		constructor(context, time, grid, debug) {
			this.context = context;
			this.time = time;
			this.grid = grid;
			this.debug = debug;
			this.time.add(this);
		}

		public update() {

		}

		public draw() {
			if (this.debug.drawGrid) {
				this.context.save();
				this.context.strokeStyle = 'rgba(46, 70, 119, 0.7)';
				// draw X
				for (var i = 0, l = this.grid.numCols+1; i<l; i++) {
					var x = i * this.grid.cellWidth;
					this.context.beginPath();
					this.context.moveTo(x, 0);
					this.context.lineTo(x, this.grid.height);
					this.context.stroke();
				}
				// draw Y
				for (var a = 0, b = this.grid.numRows+1; a<b; a++) {
					var y = a * this.grid.cellHeight;
					this.context.beginPath();
					this.context.moveTo(0, y);
					this.context.lineTo(this.grid.width, y);
					this.context.stroke();
				}
				this.context.restore();
			}
		}

	}
}