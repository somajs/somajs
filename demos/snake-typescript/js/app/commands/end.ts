module snake {
	export class EndCommand {

		public dispatcher:any = null;

		public execute() {
			this.dispatcher.dispatch('start');
		}

	}
}