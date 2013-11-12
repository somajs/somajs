declare module infuse {

	var version: string;
	export function getConstructorParams(cl: any);

	export class Injector {
		createChild():Injector;
		getMappingVo(prop: string):any;
		mapValue(prop: string, val: any):Injector;
		mapClass(prop: string, cl: any, singleton?: boolean):Injector;
		removeMapping(prop: string):Injector;
		hasMapping(prop: string):boolean;
		hasInheritedMapping(prop: string):boolean;
		getMapping(value: any):string;
		getValue(prop:string):any;
		getClass(prop:string):any;
		instantiate(TargetClass: any, ...args: any[]):any;
		inject(target: any, isParent: boolean):Injector;
		getInjectedValue(vo: any, name:string):any;
		createInstance(...args: any[]):any;
		getValueFromClass(cl: any):any;
		dispose():void;
	}
}

declare module soma {

	var version: string;

	export class Event {
		clone():any;
		preventDefault():any;
		isDefaultPrevented():boolean;
	}

	export class EventDispatcher {
		addEventListener(type: string, listener: any, priority?: boolean):void;
		removeEventListener(type: string, listener: any):void;
		hasEventListener(type: string):boolean;
		dispatchEvent(event: any):boolean;
		dispatch(type: string, params?: any):any;
		dispose():void;
	}
}

declare module soma {

	module plugins {
		export function add(plugin: any);
		export function remove(plugin: any);
	}

	var version: string;
	export function applyProperties(target: any, extension: any, bindToExtension: boolean, list?: any[]);
	export function augment(target: any, extension: any, list?: any[]);
	export function inherit(target: any, parent: any);
	export function extend(obj: any);

	export class Application {
		injector: infuse.Injector;
		dispatcher: soma.EventDispatcher;
		commands: soma.Commands;
		mediators: soma.Mediators;
		init():void;
		start():void;
		dispose():void;
		createTemplate(cl: any, domElement: any): any;
	}
	export class Commands {
		has(commandName: string):boolean;
		get(commandName: string):any;
		getAll():any;
		add(commandName: string, command: any):void;
		remove(commandName: string):void;
		dispose():void;
	}
	export class Mediators {
		create(cl:any, target:any):any;
		dispose():void;
	}
}
