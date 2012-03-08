var app = Davis(function () {

	this.bind('start', function () {
		console.log("START", Davis.location.current());
	})

	this.get('/router/', function (req) {
		console.log("Hello ROOT " + req.params['name'])
	});
	this.get('/router/about/:name', function (req) {
		console.log("Hello " + req.params['name'])
	});
	this.state('/router/about/:name', function(rep) {
		console.log("state " + req.params['name'])
	});


})

app.start();
