var NavigationConstants = {
	ABOUT: "about",
	DOWNLOAD: "download",
	TUTORIAL: "tutorial",
	DOC: "doc",
	BROWSERS: "browsers"
};

var DetectConstants = {
	CLICK_EVENT: Modernizr.touch ? "touchstart" : "click"
};

alert(DetectConstants.CLICK_EVENT)