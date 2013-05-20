declare module infuse {
	export class Injector {
		mapValue: (prop: String, value: any) => any;
		mapClass: (prop: String, cl: any, singleton?: Boolean) => any;
	}
}

declare module soma {
	export class EventDispatcher {
		dispatch: (type: String, params?: any) => any;
	}
	export class Event {

	}
}

declare module soma {
	export class Application {
		injector: infuse.Injector;
		dispatcher: soma.EventDispatcher;
		commands: soma.Commands;
		mediators: soma.Mediators;
	}
	export class Commands {
		add(name: String, command: any);
	}
	export class Mediators {
		create(cl:any, target:any);
	}
}
