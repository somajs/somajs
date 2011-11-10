var dispatcher = new soma.EventDispatcher;

dispatcher.dispose();
dispatcher = null;
dispatcher = new soma.EventDispatcher;


dispatcher.addEventListener('test', handlerSecond, 0);
dispatcher.addEventListener('test', handlerFirst, 1); // should trigger first

//dispatcher.removeEventListener('test', handlerFirst);
//dispatcher.removeEventListener('test', handlerSecond);

console.log('test has listener', dispatcher.hasEventListener('test'));
console.log('test private (should be undefined):', dispatcher.listeners);

dispatcher.dispatchEvent(new soma.Event('test'))

console.log(dispatcher);

function handlerFirst(event) {
	console.log('handler', event);
}

function handlerSecond(event) {
	console.log('handler', event);
}
