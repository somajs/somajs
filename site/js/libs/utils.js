var utils = utils || {};

// dom manipulation
utils.create = (function() {
	var el = document.createElement('div');
	return function(inEl) {
		if(typeof inEl === 'string') {
			el.innerHTML = inEl;
			return el.childNodes[0];
		}
		else if(inEl instanceof HTMLElement) {
			return inEl.cloneNode();
		}
		return this;
	}
}());
utils.append = function(target, strElement) {
	var el = this.create(strElement);
	target.appendChild(el);
	return el;
};
utils.before = function(target, strElement, refElement) {
	var el = this.create(strElement);
	target.insertBefore(el, refElement);
	return el;
};

// css
utils.hasClass = function (el,cl) {
	return el.className.match(new RegExp('(\\s|^)'+cl+'(\\s|$)'));
};
utils.addClass = function (el,cl) {
	if (!this.hasClass(el,cl)) el.className += " "+cl;
};
utils.removeClass = function (el,cl) {
	if (this.hasClass(el,cl)) {
    	var reg = new RegExp('(\\s|^)'+cl+'(\\s|$)');
		el.className=el.className.replace(reg,' ');
	}
};

// event
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
