var TwitterEvent = function(type, keywords){
	return soma.Event.call(this, type, {keywords:keywords});
};
TwitterEvent.prototype = new soma.Event();
TwitterEvent.prototype.constructor = TwitterEvent;
TwitterEvent.SEARCH = "TwitterEvent.SEARCH";
TwitterEvent.SEARCH_RESULT = "TwitterEvent.SEARCH_RESULT";
