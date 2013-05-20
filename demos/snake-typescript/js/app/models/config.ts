module snake {
	export class Config {

		public debug: any;
		public fps: number;
		public speed: number;
		public canvas: any;
		public grid: any;

		constructor() {
			this.debug = true;
			this.fps = 60;
			this.speed = 0.15;
			this.canvas = {
				width: 800,
				height: 576
			};
			this.grid = {
				width: 32,
				height: 32
			};
			this.debug = {
				drawGrid: true
			};
		}

	}
}
