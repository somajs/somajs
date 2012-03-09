Davis.extend(Davis.hashRouting({ prefix: "!" }))
var app = Davis(function () {

	var self = this;

	// need it outside if the hashrouting is enable
	$('a[href^="#"]').each(function(index, value) {
		var href = $(value).attr("href").toString().replace("#", "/router/");
		$(value).attr("href", href);
		console.log($(value));
	});
	if (typeof window.history.pushState === 'function') {
		// fix anchor
		$('a[href^="#"]').each(function(index, value) {
			var href = $(value).attr("href").toString().replace("#", "/router/");
			$(value).attr("href", href);
		});
//		// fix hash
//		if (window.location.hash.indexOf('#') != -1) {
//			window.location = window.location.href.replace("#", "");
//		}
	}

	this.bind('start', function (req) {
		console.log("START", Davis.location.current());
		self.showDiv(Davis.location.current());
	})

	this.get('/router', function (req) {
		console.log("Hello ROOT " + req.params['name'])
	});
	this.get('/router/:name', function (req) {
		console.log("Hello " + req.params['name'])
		self.showDiv(Davis.location.current());
	});
	this.get('/router/nav/:name', function (req) {
		console.log("Hello " + req.params['name'])
		self.showDiv(Davis.location.current());
	});

	this.showDiv = function(name) {
		console.log('SHOW', name);
		self.hideAll();
		if (name == "" || name == "/") name = "one";
		name = name.replace(/\//g, "");
		name = name.replace("router", "");
		$('#' + name).css('display', 'block');
	};

	this.hideAll = function() {
		$('div').css("display", "none");
	};

})

app.start();
