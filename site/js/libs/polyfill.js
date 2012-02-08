var utils = {};
// dom manipulation polyfill
utils.createElement = function(strElement) {
	var el = document.createElement("div");
	el.innerHTML = strElement;
	return el.childNodes[0];
};
utils.append = function(target, strElement) {
	var el = this.createElement(strElement);
	target.appendChild(el);
	return el;
};
utils.before = function(target, strElement, refElement) {
	var el = this.createElement(strElement);
	target.insertBefore(el, refElement);
	return el;
};
// event polyfill
utils.addEventListener = function(el, evt, fn, bubble) {
  if("addEventListener" in el) {
    // BBOS6 doesn't support handleEvent, catch and polyfill
    try {
      el.addEventListener(evt, fn, bubble);
    } catch(e) {
      if(typeof fn == "object" && fn.handleEvent) {
        el.addEventListener(evt, function(e){
        // Bind fn as this and set first arg as event object
        fn.handleEvent.call(fn,e);
        }, bubble);
      } else {
        throw e;
      }
    }
  } else if("attachEvent" in el) {
    // check if the callback is an object and contains handleEvent
    if(typeof fn == "object" && fn.handleEvent) {
      el.attachEvent("on" + evt, function(){
        // Bind fn as this
        fn.handleEvent.call(fn);
      });
    } else {
      el.attachEvent("on" + evt, fn);
    }
  }
}
utils.removeEventListener = function(el, evt, fn, bubble) {
  if("removeEventListener" in el) {
    // BBOS6 doesn't support handleEvent, catch and polyfill
    try {
      el.removeEventListener(evt, fn, bubble);
    } catch(e) {
      if(typeof fn == "object" && fn.handleEvent) {
        el.removeEventListener(evt, function(e){
          // Bind fn as this and set first arg as event object
          fn.handleEvent.call(fn,e);
        }, bubble);
      } else {
        throw e;
      }
    }
  } else if("detachEvent" in el) {
    // check if the callback is an object and contains handleEvent
    if(typeof fn == "object" && fn.handleEvent) {
      el.detachEvent("on" + evt, function(){
        // Bind fn as this
        fn.handleEvent.call(fn);
      });
    } else {
      el.detachEvent("on" + evt, fn);
    }
  }
}
