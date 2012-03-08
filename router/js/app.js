var app = Davis(function () {

	this.bind('start', function () {
		console.log("START", Davis.location.current());
	})

	this.get('/', function (req) {
		console.log("Hello ROOT " + req.params['name'])
	});
	this.get('/about/:name', function (req) {
		console.log("Hello " + req.params['name'])
	});
	this.state('/about/:name', function(rep) {
		console.log("state " + req.params['name'])
	});


})

app.start();
