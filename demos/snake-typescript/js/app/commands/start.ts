module snake {
	export class StartCommand {

		private foodLayer:any = null;
		private path:any = null;
		private time:any = null;

		constructor(input, collision, gridLayer, snakeLayer) {

		}

		public execute() {
			this.foodLayer.reset();
			this.path.reset();
			this.time.start();
		}
	}
}