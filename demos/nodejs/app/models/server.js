var express = require('express'),
	jsdom = require('jsdom').jsdom,
	fs = require('fs');

var Server = function(dispatcher, model, instance, rootDir, PageTemplate) {

	var server = express();

	server.configure(function () {
		server.use(express.logger('dev'));
		server.use(express.cookieParser());
		server.use(express.bodyParser());
		server.use(express.favicon());
		server.use("/styles", express.static(rootDir + '/static/styles'));
	});

	server.get('/', function(req, res) {
		res.redirect('/node.js');
	});

	server.get('/:path', function(req, res) {

		fs.readFile(rootDir + '/partials/index.html', 'utf8', function (err, data) {
			if (!err) {
				// record path
				model.setPath(req.params.path);
				// create html document
				var document = jsdom(data);
				// create template
				instance.createTemplate(PageTemplate, document.body);
				// result
				res.send(document.innerHTML);
			}
		});
	});

	return {
		start: function() {
			server.listen(3000);
			console.log('Listening on port 3000');
		}
	};

};

module.exports = Server;