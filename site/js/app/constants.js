var NavigationConstants = {
	ABOUT: "about",
	DOWNLOAD: "download",
	TUTORIAL: "tutorial",
	DOC: "doc",
	BROWSERS: "browsers"
};

var Detect = {
	CLICK: Modernizr.touch ? "touchend" : "click"
};

alert(DetectConstants.CLICK_EVENT)