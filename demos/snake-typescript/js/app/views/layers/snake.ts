module snake {
	export class SnakeLayer {

		private cell:any = null;
		private context:any = null;
		private grid:any = null;
		private snakeView:any = null;
		private path:any = null;

		constructor(context, grid, time, snake, path) {

			this.cell = {
				col: 0,
				row: 0
			};

			this.context = context;
			this.grid = grid;
			this.snakeView = snake;
			this.path = path;

			this.snakeView.width = this.grid.cellWidth;
			this.snakeView.height = this.grid.cellHeight;

			time.add(this);

		}

		public update() {
			this.snakeView.currentPath = this.path.get();
		}

		public draw() {
			this.snakeView.draw(this.context);
		}

		public getPosition() {
			return this.snakeView.currentPath.length === 0 ? null : this.snakeView.currentPath[0];
		}

	}
}