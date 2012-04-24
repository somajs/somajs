var routeEventTypes = {
	ROUTE1: "eventType1",
	ROUTE2: "eventType2",
	ROUTE3: "eventType3"
};

var routes = {
	"get": {
		"/": routeEventTypes.ROUTE1,
		":rule1": routeEventTypes.ROUTE2,
		":rule1/:rule2": routeEventTypes.ROUTE3
	},
	"post": {
		"/": routeEventTypes.ROUTE1,
		":rule1": routeEventTypes.ROUTE2,
		":rule1/:rule2": routeEventTypes.ROUTE3
	},
	"put": {
		"/": routeEventTypes.ROUTE1,
		":rule1": routeEventTypes.ROUTE2,
		":rule1/:rule2": routeEventTypes.ROUTE3
	},
	"del": {
		"/": routeEventTypes.ROUTE1,
		":rule1": routeEventTypes.ROUTE2,
		":rule1/:rule2": routeEventTypes.ROUTE3
	}
};

function findRouteWithRule(rule, array) {
	for (var i=0; i<array.length; ++i) {
		if (rule == array[i].rule) return true;
	}
	return false;
}
function findRouteWithRouteEvent(routeEvent, array) {
	for (var i=0; i<array.length; ++i) {
		if (routeEvent == array[i].routeEvent) return true;
	}
	return false;
}

function changeUrl(path) {
	var req = new Davis.Request({
		method: 'get',
		fullPath: path,
		title: ''
	});
	Davis.location.assign(req);
}

