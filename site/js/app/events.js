ApplicationEvent = soma.Event.extend({
	constructor: function(type, data, bubbles, cancelable) {
		return soma.Event.call(this, type, data, bubbles, cancelable);
	}
});
ApplicationEvent.SETUP = "ApplicationEvent.SETUP";
ApplicationEvent.CLEANUP = "ApplicationEvent.CLEANUP";

NavigationEvent = soma.Event.extend({
	constructor: function(type, navigationId, bubbles, cancelable) {
		return soma.Event.call(this, type, {navigationId:navigationId}, bubbles, cancelable);
	}
});
NavigationEvent.SELECT = "NavigationEvent.SELECT";
NavigationEvent.SELECTED = "NavigationEvent.SELECTED";

ChapterEvent = soma.Event.extend({
	constructor: function(type, chapterId, bubbles, cancelable) {
		return soma.Event.call(this, type, {chapterId:chapterId}, bubbles, cancelable);
	}
});
ChapterEvent.NEXT = "ChapterEvent.NEXT";
ChapterEvent.ACTIVATE = "ChapterEvent.ACTIVATE";

