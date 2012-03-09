Davis.extend(Davis.hashRouting({ prefix: "!/" }))
var app = Davis(function () {

	var self = this;

	var baseUrl = $('base').attr("href");

	console.log("base URL", baseUrl);

	// need it outside if the hashrouting is enable
	$('a[href^="#"]').each(function(index, value) {
		var href = $(value).attr("href").toString().replace("#", "");
		$(value).attr("href", href);
		console.log($(value));
	});

//	if (typeof window.history.pushState === 'function') {
//		// fix anchor
//		$('a[href^="#"]').each(function(index, value) {
//			var href = $(value).attr("href").toString().replace("#", "");
//			$(value).attr("href", href);
//		});
//	}

	this.bind('start', function (req) {
		console.log("START", Davis.location.current());
		self.showDiv(Davis.location.current());
	})

	this.get(baseUrl, function (req) {
		console.log("ROOT " + req)
		self.showDiv(Davis.location.current());
	});
	this.get(':name', function (req) {
		console.log(":name " + req.params['name'])
		self.showDiv(Davis.location.current());
	});
	this.get('nav/:name', function (req) {
		console.log("nav/:name " + req.params['name'])
		self.showDiv(Davis.location.current());
	});

	this.showDiv = function(name) {
		self.hideAll();
		console.log(baseUrl);
		name = name.replace(baseUrl, "");
		console.log("name:", name);
		name = name.replace(/\//g, "-");
		console.log("name:", name);
		if (name == "" || name == "/" || name == "-") name = "one";
		console.log("name:", name);
		console.log('SHOW div', name);
		$('#' + name).css('display', 'block');
	};

	this.hideAll = function() {
		$('div').css("display", "none");
	};

})

app.start();
