function handler(event) {
	alert('handler: ' + event.type)
}

function bindCustomEvent(el, eventName, eventHandler){
	if (el.attachEvent) {
		if (!el[eventName]) {
			el[eventName] = 0;
		}
		el.attachEvent("onpropertychange", function(event){
			if (event.propertyName == eventName) {
				eventHandler({type:eventName});
			}
		});
	}
}

bindCustomEvent(document.getElementById('el'), "myType", handler);

dispatchFakeEvent = function(el, eventName, bubble){
	bubble = !bubble ? false : true;
	if (el.nodeType === 1 && el[eventName]>=0) {
		el[eventName]++;
	}
	if (bubble && el !== document) {
		dispatchFakeEvent(el.parentNode, eventName, bubble);
	}
};

document.getElementById('bt').attachEvent('onclick', function(){
	dispatchFakeEvent(document.getElementById('el'), 'myType', true);//false = bubble
});

//document.getElementById('el').dispatchEvent({})


so the user can do

document.getElementById('bt').attacheEvent('onclick', handler.bind(this));
function handler(event) {
	this.dispatchEvent(new soma.Event("myCommand"))
}
