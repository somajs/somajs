var NavigationConstants = {
	ABOUT: "about",
	DOWNLOAD: "download",
	TUTORIAL: "tutorial",
	BROWSERS: "browsers",
	DEMOS: "demos",
	PLUGINS: "plugins",
	DOCS: "docs"
};

var Detect = {
	CLICK: Modernizr.touch ? "touchstart" : "click",
	IS_TOUCH: Modernizr.touch
};

var TrackingConstants = {
	NAVIGATION: "navigation",
	BUTTON: "button"
};
