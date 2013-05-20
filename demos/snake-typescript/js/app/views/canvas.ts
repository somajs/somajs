module snake {
	export class Canvas {

		private context;
		private grid;

		constructor(target, injector, grid, time) {
			this.context = target.getContext('2d');
			this.grid = grid;
			injector.mapValue('canvas', target);
			injector.mapValue('context', this.context);
			time.add(this);
		}

		public update() {

		}

		public draw() {
			this.context.clearRect(0, 0, this.grid.width, this.grid.height);
		}

	}
}