var LoginService = function(){};
LoginService.prototype = {
	responder: null,
	vo: null,
	login: function(responder, vo) {
		this.responder = responder;
		this.vo = vo;
		// simulation of a remote call
		setTimeout(this.complete.bind(this), 500);
	},
	complete: function() {
		if (this.vo.username == 'js' && this.vo.password == 'soma') {
			this.responder.result({id:"LoginAttempt " + new Date().getTime(), result:"success"});
		}
		else {
			this.responder.fault({id:"LoginAttempt " + new Date().getTime(), result:"error"});
		}
	}
};
