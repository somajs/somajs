var ServerCommand = function(server) {
	this.execute = function(event) {
		server.start();
	};
};

module.exports = ServerCommand;