module snake {
	export class FoodLayer {

		private cell:any = null;
		private context:any = null;
		private grid:any = null;
		private foodView:any = null;

		constructor(context, grid, time, food) {

			this.cell = {
				col: 0,
				row: 0
			};

			this.context = context;
			this.grid = grid;
			this.foodView = food;

			this.foodView.width = this.grid.cellWidth;
			this.foodView.height = this.grid.cellHeight;

			time.add(this);

		}

		private setRandomPosition() {
			this.cell.col = Math.floor((Math.random() * this.grid.numCols));
			this.cell.row = Math.floor((Math.random() * this.grid.numRows));
			this.foodView.x = this.cell.col * this.grid.cellWidth;
			this.foodView.y = this.cell.row * this.grid.cellHeight;
		}

		public update() {

		}

		public draw() {
			this.foodView.draw(this.context);
		}

		public getPosition() {
			return this.cell;
		}

		public reset() {
			this.setRandomPosition();
		}

	}
}