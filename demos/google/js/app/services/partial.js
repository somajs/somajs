(function(global) {

	var PartialService = function() {
		this.ajax = null;
	};

	PartialService.prototype.load = function(url, callback) {
		this.ajax({
			url: url,
			async: false,
			success: function (data){
				callback(data);
			}
		});
	};

	// exports
	global.gp = global.gp || {};
	global.gp.PartialService = PartialService;

})(this);