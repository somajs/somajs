/*
var EventList = {TEST: "test_event"};

TestCommand = new Class ({
	Extends: soma.core.controller.Command,
	execute: function(event) {
		switch(event.type) {
			case EventList.TEST:
//				console.log('EXECUTED');
				break;
		}
	}
});

var somaApp = new soma.core.Core;

somaApp.addCommand(EventList.TEST, TestCommand);
somaApp.addEventListener(EventList.TEST, handlerFirst);
somaApp.dispatchEvent(new soma.Event(EventList.TEST, true, true));

function handlerFirst(event) {
	console.log('handler', event);
	event.preventDefault();
}
*/

var somaApp = new soma.core.Core;

var TestWire = new Class({
	Extends: soma.core.wire.Wire
	,init: function() {
		console.log('OK');
	}
});

function listenerBound(event) {
	console.log('RECEIVED');
}

var wire = new TestWire();
this.somaApp.addWire( "wirename", wire  );
wire.addEventListener( "test", this.listenerBound );
this.somaApp.dispatchEvent( new soma.Event("test") );
wire.removeEventListener( "test", this.listenerBound );
this.somaApp.dispatchEvent( new soma.Event("test") );