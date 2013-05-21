///<reference path='../models/config.ts'/>
///<reference path='../interfaces/time.ts'/>

module snake {

	export class Time implements ITime {

		private speedHandlers:any[] = null;
		private speedTimeoutId:number = 0;
		private speed:number = 0;
		private speedLoop:any = null;

		public config:snake.Config = null;

		constructor(config:snake.Config) {
			this.speedHandlers = [];
			this.speed = config.speed;
			this.speedLoop = this.speedLoopHandler.bind(this);
		}

		private speedLoopHandler() {
			for (var i = 0, l = this.speedHandlers.length; i<l; i++) {
				if (typeof this.speedHandlers[i] === 'function') {
					this.speedHandlers[i]();
				}
			}
			this.speedTimeoutId = setTimeout(this.speedLoop, this.speed * 1000);
		}

		public add(target:any) {
			if (typeof target.update === 'function' && typeof target.draw === 'function') {
				(function loop() {
					target.update();
					target.draw();
					window.requestAnimationFrame(loop);
				})();
			}
		}

		public addSpeedHandler(handler) {
			this.speedHandlers.push(handler);
		}

		public start() {
			if (this.speedTimeoutId === 0) {
				this.speedLoop();
			}
		}
	}
}