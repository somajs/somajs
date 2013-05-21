module snake {
	export interface ITime {
		add(target:any): void;
		addSpeedHandler(handler:any): void;
		start(): void;
	}
}
